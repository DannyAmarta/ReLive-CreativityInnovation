"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { print } from "graphql";
import { z } from "zod";
import { authFetchGraphql, isAuthenticationGraphqlError } from "../fetchGraphQL";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session.server";
import {
  CREATE_BOOKING_MUTATION,
  CREATE_TRAINER_SERVICE_MUTATION,
  CREATE_REVIEW_MUTATION,
  REQUEST_FIAT_BOOKING_DEPOSIT_MUTATION,
  REQUEST_FIAT_WITHDRAWAL_MUTATION,
  UPDATE_BOOKING_STATUS_MUTATION,
  UPDATE_TRAINER_SERVICE_MUTATION,
  PROPOSE_RESCHEDULE_MUTATION,
  RESOLVE_RESCHEDULE_MUTATION,
  REQUEST_CANCELLATION_MUTATION,
  RESOLVE_CANCELLATION_MUTATION,
} from "../gqlQueries";

type CreateBookingResponse = {
  createBooking: {
    id: number;
  };
};

type FiatDepositResponse = {
  requestFiatBookingDeposit: {
    paymentUrl: string;
  };
};

export type ServiceFormState = {
  error: string | null;
  fields?: {
    title?: string;
    description?: string;
    priceInIdr?: string;
    priceInTokenUnits?: string;
  };
};

// Zod schema for service creation/update
const ServiceSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priceInIdr: z.coerce.number().int().positive().nullable().optional(),
    priceInTokenUnits: z.coerce.number().positive().nullable().optional(),
  })
  .refine((data) => data.priceInIdr || data.priceInTokenUnits, {
    message: "Set at least one price — either IDR or Token price",
    path: ["priceInIdr"],
  });

function parseIntField(value: FormDataEntryValue | null, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function parseTokenUnitsToLamports(value: FormDataEntryValue | null): number | null {
  if (!value || value.toString().trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 1_000_000);
}

function redirectWithSessionWarning(path: string) {
  const url = new URL(path, "http://local-session");
  url.searchParams.set("session", "expired");
  redirect(`${url.pathname}${url.search}`);
}

export async function createBookingAction(formData: FormData) {
  const trainerId = parseIntField(formData.get("trainerId"), "trainerId");
  const serviceId = parseIntField(formData.get("serviceId"), "serviceId");
  const paymentMethod = (formData.get("paymentMethod")?.toString() ?? "FIAT").toUpperCase();
  const scheduledStart = formData.get("scheduledStart")?.toString();
  const scheduledEnd = formData.get("scheduledEnd")?.toString();
  const timezone = formData.get("timezone")?.toString();
  
  const trainerProfilePath = `/client/trainers/${trainerId}`;

  if (!scheduledStart || !scheduledEnd) {
    throw new Error("Missing scheduled time slot");
  }

  let bookingData: CreateBookingResponse;

  try {
    bookingData = await authFetchGraphql<CreateBookingResponse>(print(CREATE_BOOKING_MUTATION), {
      input: { trainerId, serviceId, scheduledStart, scheduledEnd, timezone },
    });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      redirectWithSessionWarning(trainerProfilePath);
    }

    throw error;
  }

  const bookingId = bookingData.createBooking.id;

  revalidatePath("/client/dashboard");
  revalidatePath("/trainer");
  revalidatePath("/trainer/bookings");

  if (paymentMethod === "FIAT") {
    const paymentMethodCode = formData.get("paymentMethodCode")?.toString() || undefined;
    let paymentUrl: string | null = null;
    let fiatError: unknown = null;

    try {
      const fiatData = await authFetchGraphql<FiatDepositResponse>(
        print(REQUEST_FIAT_BOOKING_DEPOSIT_MUTATION),
        { input: { bookingId, paymentMethodCode } },
      );
      paymentUrl = fiatData.requestFiatBookingDeposit.paymentUrl;
    } catch (error) {
      fiatError = error;
      if (isAuthenticationGraphqlError(error)) {
        redirectWithSessionWarning(`/client/dashboard?booking=${bookingId}&payment=fiat-pending`);
      }
    }

    if (paymentUrl) {
      redirect(paymentUrl);
    }

    console.error('Fiat deposit creation failed for booking', bookingId, fiatError);
    redirect(`/client/dashboard?booking=${bookingId}&payment=fiat-pending`);
  }

  redirect(`/client/dashboard?booking=${bookingId}&payment=crypto-pending`);
}

export async function updateBookingStatusAction(formData: FormData) {
  const bookingId = parseIntField(formData.get("bookingId"), "bookingId");
  const status = formData.get("status")?.toString();
  const disputeReason = formData.get("disputeReason")?.toString() || undefined;
  const redirectTo = formData.get("redirectTo")?.toString() || "/trainer/bookings";

  if (!status) {
    throw new Error("status is required");
  }

  try {
    await authFetchGraphql(print(UPDATE_BOOKING_STATUS_MUTATION), {
      input: { bookingId, status, disputeReason },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as any).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    if (isAuthenticationGraphqlError(error)) {
      redirectWithSessionWarning(redirectTo);
    }

    let errorMsg = error instanceof Error ? error.message : "Something went wrong";
    if (typeof error === 'object' && error !== null && 'graphqlErrors' in error) {
      const gqlErrors = (error as any).graphqlErrors;
      if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
        errorMsg = gqlErrors[0].message || errorMsg;
      }
    }

    // Clean up error prefix if present
    errorMsg = errorMsg.replace(/^GraphQL error:\s*/i, "");

    // Redirect to the same page but with an error parameter
    const redirectUrl = new URL(redirectTo, "http://local");
    redirectUrl.searchParams.set("error", errorMsg);
    
    redirect(`${redirectUrl.pathname}${redirectUrl.search}`);
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/trainer");
  revalidatePath("/trainer/bookings");
  revalidatePath("/trainer/wallet");

  redirect(redirectTo);
}

export async function saveTrainerServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const serviceIdValue = formData.get("serviceId")?.toString();

  // Parse raw values (allow empty strings → null)
  const priceInIdrRaw = formData.get("priceInIdr")?.toString().trim();
  const priceInTokenRaw = formData.get("priceInTokenUnits")?.toString().trim();

  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  const parsed = ServiceSchema.safeParse({
    title,
    description,
    priceInIdr: priceInIdrRaw || undefined,
    priceInTokenUnits: priceInTokenRaw || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
    return {
      error: firstError,
      fields: {
        title,
        description,
        priceInIdr: priceInIdrRaw,
        priceInTokenUnits: priceInTokenRaw,
      },
    };
  }

  const { priceInIdr, priceInTokenUnits } = parsed.data;
  const priceInLamports = priceInTokenUnits ? Math.round(priceInTokenUnits * 1_000_000) : null;

  try {
    if (serviceIdValue) {
      await authFetchGraphql(print(UPDATE_TRAINER_SERVICE_MUTATION), {
        input: {
          serviceId: Number(serviceIdValue),
          title,
          description,
          priceInLamports,
          priceInIdr: priceInIdr ?? null,
        },
      });
    } else {
      await authFetchGraphql(print(CREATE_TRAINER_SERVICE_MUTATION), {
        input: {
          title,
          description,
          priceInLamports,
          priceInIdr: priceInIdr ?? null,
        },
      });
    }
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      const url = new URL("/trainer/services", "http://local");
      url.searchParams.set("session", "expired");
      redirect(`${url.pathname}${url.search}`);
    }
    const message = error instanceof Error ? error.message : "Failed to save service";
    return {
      error: message,
      fields: {
        title,
        description,
        priceInIdr: priceInIdrRaw,
        priceInTokenUnits: priceInTokenRaw,
      },
    };
  }

  revalidatePath("/trainer/services");
  revalidatePath("/client/trainers");
  revalidatePath("/trainer");
  redirect("/trainer/services");
}

export async function toggleTrainerServiceAction(formData: FormData) {
  const serviceId = parseIntField(formData.get("serviceId"), "serviceId");
  const isActive = formData.get("isActive")?.toString() === "true";

  try {
    await authFetchGraphql(print(UPDATE_TRAINER_SERVICE_MUTATION), {
      input: { serviceId, isActive: !isActive },
    });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      redirectWithSessionWarning("/trainer/services");
    }

    throw error;
  }

  revalidatePath("/trainer/services");
  revalidatePath("/client/trainers");
  redirect("/trainer/services");
}

export async function requestFiatWithdrawalAction(formData: FormData) {
  const amountIdr = parseIntField(formData.get("amountIdr"), "amountIdr");
  const paymentMethod = formData.get("paymentMethod")?.toString() || "BANK_TRANSFER";
  const bankCode = formData.get("bankCode")?.toString() || undefined;
  const accountNumber = formData.get("accountNumber")?.toString() || undefined;
  const accountName = formData.get("accountName")?.toString() || undefined;
  const ewalletPhone = formData.get("ewalletPhone")?.toString() || undefined;

  try {
    await authFetchGraphql(print(REQUEST_FIAT_WITHDRAWAL_MUTATION), {
      input: {
        amountIdr,
        paymentMethod,
        bankCode,
        accountNumber,
        accountName,
        ewalletPhone,
      },
    });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      redirectWithSessionWarning("/trainer/wallet");
    }

    throw error;
  }

  revalidatePath("/trainer/wallet");
  revalidatePath("/trainer");
  redirect("/trainer/wallet?withdrawal=requested");
}

export async function proposeRescheduleAction(formData: FormData) {
  const bookingId = parseIntField(formData.get("bookingId"), "bookingId");
  const proposedStart = formData.get("proposedStart")?.toString();
  const proposedEnd = formData.get("proposedEnd")?.toString();
  const timezone = formData.get("timezone")?.toString() || "Asia/Jakarta";
  const redirectTo = formData.get("redirectTo")?.toString() || "/client/bookings/reschedule";

  if (!proposedStart || !proposedEnd) throw new Error("proposedStart and proposedEnd are required");

  try {
    await authFetchGraphql(print(PROPOSE_RESCHEDULE_MUTATION), {
      input: { bookingId, proposedStart, proposedEnd, timezone },
    });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) redirect(`${redirectTo}?session=expired`);
    throw error;
  }

  revalidatePath("/client/bookings/reschedule");
  revalidatePath("/trainer/bookings");
  redirect(`${redirectTo}?reschedule=proposed`);
}

export async function resolveRescheduleAction(formData: FormData) {
  const requestId = parseIntField(formData.get("requestId"), "requestId");
  const action = formData.get("action")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/client/bookings/reschedule";

  if (!action) throw new Error("action is required");

  try {
    await authFetchGraphql(print(RESOLVE_RESCHEDULE_MUTATION), { input: { requestId, action } });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) redirect(`${redirectTo}?session=expired`);
    throw error;
  }

  revalidatePath("/client/bookings/reschedule");
  revalidatePath("/client/dashboard");
  revalidatePath("/trainer/bookings");
  redirect(`${redirectTo}?reschedule=resolved`);
}

export async function requestCancellationAction(formData: FormData) {
  const bookingId = parseIntField(formData.get("bookingId"), "bookingId");
  const reason = formData.get("reason")?.toString() || undefined;
  const redirectTo = formData.get("redirectTo")?.toString() || "/client/bookings/cancel";

  try {
    await authFetchGraphql(print(REQUEST_CANCELLATION_MUTATION), { input: { bookingId, reason } });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) redirect(`${redirectTo}?session=expired`);
    throw error;
  }

  revalidatePath("/client/bookings/cancel");
  revalidatePath("/trainer/bookings");
  redirect(`${redirectTo}?cancellation=requested`);
}

export async function resolveCancellationAction(formData: FormData) {
  const requestId = parseIntField(formData.get("requestId"), "requestId");
  const action = formData.get("action")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/client/bookings/cancel";

  if (!action) throw new Error("action is required");

  try {
    await authFetchGraphql(print(RESOLVE_CANCELLATION_MUTATION), { input: { requestId, action } });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) redirect(`${redirectTo}?session=expired`);
    throw error;
  }

  revalidatePath("/client/bookings/cancel");
  revalidatePath("/client/dashboard");
  revalidatePath("/trainer/bookings");
  redirect(`${redirectTo}?cancellation=resolved`);
}

export async function createReviewAction(formData: FormData) {
  const bookingId = parseIntField(formData.get("bookingId"), "bookingId");
  const rating = parseIntField(formData.get("rating"), "rating");
  const comment = formData.get("comment")?.toString().trim() || undefined;
  const isAnonymous = formData.get("isAnonymous") === "true";
  const redirectTo = formData.get("redirectTo")?.toString() || "/client/dashboard";

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  try {
    await authFetchGraphql(print(CREATE_REVIEW_MUTATION), {
      input: { bookingId, rating, comment, isAnonymous },
    });
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      redirect(`${redirectTo}?session=expired`);
    }
    throw error;
  }

  revalidatePath("/client/dashboard");
  revalidatePath("/client/trainers");
  redirect(`${redirectTo}?review=submitted`);
}

export async function verifyBookingPaymentAction(bookingId: number) {
  const session = await getSession();
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = Number(session.user.id);

  // Retrieve the booking record
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trainer: true,
    },
  });

  if (!booking) {
    return { status: "NOT_FOUND" };
  }

  // Ensure this booking belongs to the current user
  if (booking.clientId !== userId) {
    throw new Error("Unauthorized access to booking");
  }

  // If status is ACTIVE, verify/create conversation
  if (booking.status === "ACTIVE") {
    const trainerUserId = booking.trainer.userId;
    const clientUserId = booking.clientId;

    // Check if conversation already exists
    let conversation = await prisma.conversation.findUnique({
      where: {
        trainerUserId_clientUserId: {
          trainerUserId,
          clientUserId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          trainerUserId,
          clientUserId,
          bookingId: booking.id,
        },
      });
    }

    return {
      status: "ACTIVE",
      conversationId: conversation.id,
    };
  }

  return {
    status: booking.status,
  };
}
