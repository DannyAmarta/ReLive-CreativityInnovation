import { SessionWarning } from "@/components/auth/SessionWarning";
import { CheckCircle2, Send, X } from "lucide-react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { getMyTrainerBookings, lamportsToTokenUnits } from "@/lib/marketplace";

export default async function TrainerBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const bookingsResult = await Promise.allSettled([getMyTrainerBookings()]);
  const bookings = bookingsResult[0].status === "fulfilled" ? bookingsResult[0].value : [];
  const params = searchParams ? await searchParams : {};
  const showSessionWarning =
    params?.session === "expired" ||
    (bookingsResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult[0].reason));

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage real trainer bookings from the seeded database. Actions below now follow the backend booking state machine."
      />

      {showSessionWarning && (
        <SessionWarning description="Trainer booking data could not be refreshed with the current Google session. You can still review the page, but sign in again before approving, cancelling, or completing anything." />
      )}

      {bookings.length === 0 ? (
        <div className="glass-card-elevated p-10 text-center text-sm text-muted-foreground">
          No bookings found for this trainer profile.
        </div>
      ) : (
        <div className="glass-card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30 transition-colors align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium">{booking.client?.name ?? "Client"}</p>
                    <p className="text-[10px] text-muted-foreground">{booking.client?.email ?? "No email available"}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{booking.service?.title ?? "Service"}</td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.paymentType ?? "PENDING"} />
                  </td>
                  <td className="px-5 py-4 font-mono tabular-nums">
                    {booking.paymentType === "FIAT"
                      ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                      : formatUSDC(lamportsToTokenUnits(booking.service?.priceInLamports))}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <StatusBadge status={booking.status} />
                      {booking.disputeReason && (
                        <p className="max-w-xs text-[11px] text-destructive">{booking.disputeReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <ActionForm bookingId={booking.id} status="ACTIVE" redirectTo="/trainer/bookings">
                            Approve
                          </ActionForm>
                          <ActionForm bookingId={booking.id} status="CANCELLED" redirectTo="/trainer/bookings" variant="destructive">
                            <X className="size-3 mr-1.5" /> Cancel
                          </ActionForm>
                        </>
                      )}
                      {booking.status === "ACTIVE" && (
                        <ActionForm bookingId={booking.id} status="COMPLETED" redirectTo="/trainer/bookings">
                          {booking.paymentType === "CRYPTO" ? (
                            <>
                              <Send className="size-3 mr-1.5" /> Mark complete
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-3 mr-1.5" /> Complete
                            </>
                          )}
                        </ActionForm>
                      )}
                      {booking.status === "COMPLETED" && booking.paymentType === "CRYPTO" && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-[11px] text-primary">
                          Release step next
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionForm({
  bookingId,
  status,
  redirectTo,
  children,
  variant = "primary",
}: {
  bookingId: number;
  status: string;
  redirectTo: string;
  children: React.ReactNode;
  variant?: "primary" | "destructive";
}) {
  const className =
    variant === "destructive"
      ? "inline-flex h-8 items-center rounded-full border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
      : "inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90";

  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
