import gql from 'graphql-tag';

// mutation{
// 	createUser(createUserInput:{
// 		name:"",
// 		password:"",
// 		email:""
// 	})
// 	{
// 		id
// 		name
// 	}
// }
// sesuai dengan return yang sekarang yaitu hanya messsage.
export const CREATE_USER_MUTATION = gql`
    mutation register($input: CreateUserInput!){
        register(createUserInput: $input){
            message
        }
    }
`;

// mutation{
// 	signIn(SignInInput:{
// 		email:"x@gmail.com",
// 		password:"123"
// 	})
// 	{
// 		id
// 		name
// 		avatar
// 		accessToken
// 	}
// }
export const SIGN_IN_MUTATION = gql`
    mutation signIn($input: SignInInput!){
        signIn(signInInput: $input){
            id
            name
            avatar
            accessToken
        }
    }
`

// mutation {
//   forgotPassword(forgotInput: { email: "user@email.com" }) {
//     message
//   }
// }
export const FORGOT_PASSWORD = gql`
    mutation ForgotPassword($input: ForgotPasswordDto!){
        forgotPassword(forgotInput: $input){
            message
        }
    }
`

// mutation {
//   resetPassword(resetInput: { token: "reset-token", newPassword: "NewPassword123!" }) {
//     message
//   }
// }
export const RESET_PASSWORD = gql`
    mutation resetPassword($input: ResetPasswordDto!) {
        resetPassword(resetInput: $input) {
            message
        }
    }
`

// query {
//   searchFoods(query: "chicken breast", page: 1, pageSize: 8, servingSize: 100) {
//     query
//     sourceUsed
//     cacheHit
//     fallbackUsed
//     page
//     pageSize
//     servingSize
//     totalReturned
//     items {
//       id
//       name
//       brand
//       nutrients {
//         calories
//         proteinGrams
//         carbsGrams
//         fatGrams
//       }
//     }
//   }
// }
export const SEARCH_FOODS_QUERY = gql`
    query SearchFoods($query: String!, $page: Int!, $pageSize: Int!, $servingSize: Int!) {
        searchFoods(query: $query, page: $page, pageSize: $pageSize, servingSize: $servingSize) {
            query
            sourceUsed
            cacheHit
            fallbackUsed
            page
            pageSize
            servingSize
            totalReturned
            items {
                id
                source
                sourceId
                name
                description
                brand
                referenceServingSize
                referenceServingUnit
                servingSize
                servingUnit
                per100gNutrients {
                    calories
                    proteinGrams
                    carbsGrams
                    fatGrams
                    fiberGrams
                    sugarGrams
                    sodiumMilligrams
                }
                nutrients {
                    calories
                    proteinGrams
                    carbsGrams
                    fatGrams
                    fiberGrams
                    sugarGrams
                    sodiumMilligrams
                }
            }
        }
    }
`

// query {
//   searchRecipes(query: "chicken rice", page: 1, pageSize: 8) {
//     query
//     sourceUsed
//     cacheHit
//     fallbackUsed
//     page
//     pageSize
//     totalReturned
//     items {
//       id
//       title
//       calories
//       protein
//       cookTime
//     }
//   }
// }
export const SEARCH_RECIPES_QUERY = gql`
    query SearchRecipes($query: String!, $page: Int!, $pageSize: Int!) {
        searchRecipes(query: $query, page: $page, pageSize: $pageSize) {
            query
            sourceUsed
            cacheHit
            fallbackUsed
            page
            pageSize
            totalReturned
            items {
                id
                source
                sourceId
                title
                image
                calories
                protein
                cookTime
                ingredients
                instructions
                sourceUrl
                dietTags
            }
        }
    }
`

export const GET_ME_QUERY = gql`
    query GetMe {
        getMe {
            id
            name
            email
            role
            bio
            avatar
            # --- Add these here ---
            profileCompleted
            fitnessLevel
            primaryGoal
            vitalityScore
            # ---------------------
            hasOpenRouterConnection
            openRouterKeyLabel
            openRouterConnectedAt
            createdAt
        }
    }
`

export const EXCHANGE_OPENROUTER_CODE_MUTATION = gql`
    mutation ExchangeOpenRouterCode($input: ExchangeOpenRouterCodeInput!) {
        exchangeOpenRouterCode(input: $input) {
            success
            message
            hasConnection
            keyLabel
            connectedAt
        }
    }
`

export const DISCONNECT_OPENROUTER_MUTATION = gql`
    mutation DisconnectOpenRouter {
        disconnectOpenRouter {
            success
            message
            hasConnection
            keyLabel
            connectedAt
        }
    }
`

export const REQUEST_EMAIL_CHANGE_MUTATION = gql`
    mutation RequestEmailChange($input: RequestEmailChangeInput!) {
        requestEmailChange(input: $input) {
            status
            message
        }
    }
`

export const VERIFY_EMAIL_CHANGE_MUTATION = gql`
    mutation VerifyEmailChange($token: String!) {
        verifyEmailChange(token: $token) {
            message
        }
    }
`

export const UPDATE_PROFILE_MUTATION = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            id
            name
            bio
            email
            avatar
            # --- New Botanical Fields ---
            profileCompleted
            fitnessLevel
            dailyActivity
            primaryGoal
            vitalityScore
            # ---------------------------
            createdAt
        }
    }
`

// query {
//   setExercises {
//     id
//     name
//     category
//     formula
//     repCap
//   }
// }
export const GET_SET_EXERCISES_QUERY = gql`
    query GetSetExercises {
        setExercises {
            id
            name
            category
            formula
            description
            repCap
            requiredMetrics
        }
    }
`

// query {
//   calculateSetEstimate(
//     input: { exerciseId: "back-squat", weightKg: 140, reps: 5, rir: 1 }
//   ) {
//     exerciseName
//     formulaUsed
//     estimatedOneRepMaxKg
//     trainingMaxKg
//     confidenceScore
//   }
// }
export const CALCULATE_SET_ESTIMATE_QUERY = gql`
    query CalculateSetEstimate($input: CalculateSetInput!) {
        calculateSetEstimate(input: $input) {
            exerciseId
            exerciseName
            category
            formulaUsed
            actualReps
            rir
            effectiveReps
            boundedEffectiveReps
            boundedByRepCap
            repCap
            weightKg
            estimatedOneRepMaxKg
            trainingMaxKg
            relativeIntensityPercent
            volumeLoadKg
            durationMinutes
            distanceMeters
            pacePerKilometerMinutes
            cardioLoadScore
            estimatedCalories
            confidenceScore
            primaryEnergySystem
            insightSummary
            warnings
            recommendedLoads {
                repTarget
                weightKg
                intensityPercent
            }
        }
    }
`

// mutation {
//   logWorkoutSet(
//     input: { exerciseId: "back-squat", weightKg: 140, reps: 5, rir: 1 }
//   ) {
//     loggedSet {
//       id
//       isCnsFatigue
//     }
//     analytics {
//       emaOneRepMaxKg
//       contextSummary
//     }
//   }
// }
export const LOG_WORKOUT_SET_MUTATION = gql`
    mutation LogWorkoutSet($input: LogWorkoutSetInput!) {
        logWorkoutSet(input: $input) {
            loggedSet {
                id
                userId
                exerciseId
                exerciseName
                formulaUsed
                weightLifted
                actualReps
                rirLogged
                calculated1Rm
                isCnsFatigue
                durationMinutes
                distanceMeters
                rpeLogged
                notes
                createdAt
            }
            calculation {
                exerciseId
                exerciseName
                category
                formulaUsed
                actualReps
                rir
                effectiveReps
                boundedEffectiveReps
                boundedByRepCap
                repCap
                weightKg
                estimatedOneRepMaxKg
                trainingMaxKg
                relativeIntensityPercent
                volumeLoadKg
                durationMinutes
                distanceMeters
                pacePerKilometerMinutes
                cardioLoadScore
                estimatedCalories
                confidenceScore
                primaryEnergySystem
                insightSummary
                warnings
                recommendedLoads {
                    repTarget
                    weightKg
                    intensityPercent
                }
            }
            analytics {
                exerciseId
                exerciseName
                periodDays
                emaOneRepMaxKg
                baselineAverageOneRepMaxKg
                latestLoggedOneRepMaxKg
                latestCleanOneRepMaxKg
                recentRirTrend
                latestSessionFlagged
                performanceDropRatio
                contextSummary
                sampleSize
                isColdStart
            }
        }
    }
`



export const GENERATE_WORKOUT_RECOMMENDATION_MUTATION = gql`
    mutation GenerateWorkoutRecommendation($input: GeneratePlanDto!) {
        generateWorkoutRecommendation(input: $input) {
            phaseGoal
            source
            rationale
            contextSummary
            providerNotice
            safetyWindow {
                minWeightKg
                maxWeightKg
                minSets
                maxSets
                minReps
                maxReps
            }
            routine {
                exercise
                sets
                reps
                prescribedWeightKg
                rationale
            }
        }
    }
`

export const CHANGE_MY_ROLE_MUTATION = gql`
    mutation ChangeMyRole($role: String!) {
        changeMyRole(role: $role) {
            id
            role
            name
            email
        }
    }
`

export const DEV_REFRESH_SESSION_MUTATION = gql`
    mutation DevRefreshSession {
        devRefreshSession {
            id
            name
            avatar
            accessToken
        }
    }
`

export const GET_TRAINER_PROFILES_QUERY = gql`
    query GetTrainerProfiles {
        getTrainerProfiles {
            id
            bio
            certifications
            rating
            user {
                id
                name
                avatar
                bio
            }
            services {
                id
                title
                description
                priceInLamports
                priceInIdr
                tokenMintAddress
                isActive
            }
        }
    }
`

export const GET_TRAINER_PROFILE_QUERY = gql`
    query GetTrainerProfile($id: Int!) {
        getTrainerProfile(id: $id) {
            id
            bio
            certifications
            rating
            user {
                id
                name
                avatar
                bio
            }
            services {
                id
                title
                description
                priceInLamports
                priceInIdr
                tokenMintAddress
                isActive
            }
            reviews {
                id
                rating
                comment
                isAnonymous
                createdAt
                client {
                    id
                    name
                    avatar
                }
            }
        }
    }
`

export const GET_MY_TRAINER_PROFILE_QUERY = gql`
    query MyTrainerProfile {
        myTrainerProfile {
            id
            bio
            certifications
            rating
            user {
                id
                name
                avatar
                bio
            }
            services {
                id
                title
                description
                priceInLamports
                priceInIdr
                tokenMintAddress
                isActive
            }
        }
    }
`

export const GET_MY_CLIENT_BOOKINGS_QUERY = gql`
    query MyClientBookings {
        myClientBookings {
            id
            clientId
            status
            paymentType
            txHash
            escrowAddress
            fiatAmount
            servicePriceIdr
            processingFeeIdr
            gatewayPaymentMethod
            disputeReason
            scheduledStart
            scheduledEnd
            timezone
            meetingLink
            createdAt
            updatedAt
            trainer {
                id
                bio
                user {
                    id
                    name
                    avatar
                }
            }
            service {
                id
                title
                description
                priceInLamports
                priceInIdr
                tokenMintAddress
                isActive
            }
            review {
                id
                rating
                comment
                isAnonymous
                createdAt
            }
        }
    }
`

export const GET_MY_TRAINER_BOOKINGS_QUERY = gql`
    query MyTrainerBookings {
        myTrainerBookings {
            id
            clientId
            status
            paymentType
            txHash
            escrowAddress
            fiatAmount
            servicePriceIdr
            processingFeeIdr
            gatewayPaymentMethod
            disputeReason
            scheduledStart
            scheduledEnd
            timezone
            meetingLink
            createdAt
            updatedAt
            client {
                id
                name
                avatar
                email
            }
            service {
                id
                title
                description
                priceInLamports
                priceInIdr
                tokenMintAddress
                isActive
            }
        }
    }
`

export const CREATE_BOOKING_MUTATION = gql`
    mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
            id
            status
            paymentType
            createdAt
            trainerId
            serviceId
        }
    }
`

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
    mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
        updateBookingStatus(input: $input) {
            id
            status
            paymentType
            updatedAt
            disputeReason
        }
    }
`

export const CREATE_TRAINER_SERVICE_MUTATION = gql`
    mutation CreateTrainerService($input: CreateTrainerServiceInput!) {
        createTrainerService(input: $input) {
            id
            title
            description
            priceInLamports
            priceInIdr
            tokenMintAddress
            isActive
        }
    }
`

export const UPDATE_TRAINER_SERVICE_MUTATION = gql`
    mutation UpdateTrainerService($input: UpdateTrainerServiceInput!) {
        updateTrainerService(input: $input) {
            id
            title
            description
            priceInLamports
            priceInIdr
            tokenMintAddress
            isActive
        }
    }
`

export const REQUEST_FIAT_BOOKING_DEPOSIT_MUTATION = gql`
    mutation RequestFiatBookingDeposit($input: RequestFiatDepositInput!) {
        requestFiatBookingDeposit(input: $input) {
            paymentUrl
            transactionId
            bookingId
            totalAmount
            fee
        }
    }
`

export const GET_MY_FIAT_WALLET_QUERY = gql`
    query MyFiatWallet {
        myFiatWallet {
            id
            trainerId
            balanceIdr
            updatedAt
        }
    }
`

export const GET_MY_WITHDRAWAL_REQUESTS_QUERY = gql`
    query MyWithdrawalRequests {
        myWithdrawalRequests {
            id
            trainerId
            amountIdr
            bankCode
            accountNumber
            accountName
            paymentMethod
            status
            gatewayReference
            requestedAt
            processedAt
            failureReason
        }
    }
`

export const REQUEST_FIAT_WITHDRAWAL_MUTATION = gql`
    mutation RequestFiatWithdrawal($input: RequestWithdrawalInput!) {
        requestFiatWithdrawal(input: $input) {
            id
            trainerId
            amountIdr
            bankCode
            accountNumber
            accountName
            paymentMethod
            status
            gatewayReference
            requestedAt
            processedAt
            failureReason
        }
    }
`

export const REGISTER_TRAINER_FIAT_MUTATION = gql`
    mutation RegisterTrainerFiat($input: RegisterTrainerFiatInput!) {
        registerTrainerFiat(input: $input) {
            id
            bio
            certifications
            user {
                id
                name
                role
            }
        }
    }
`

// ─── Trainer Availability ─────────────────────────────────────────────────

export const GET_TRAINER_AVAILABILITY_RULES_QUERY = gql`
    query GetTrainerAvailabilityRules($trainerId: Int!) {
        getTrainerAvailabilityRules(trainerId: $trainerId) {
            id
            trainerId
            dayOfWeek
            specificDate
            startTime
            endTime
            isAvailable
            title
            timezone
            createdAt
            updatedAt
        }
    }
`

export const GET_AVAILABLE_SLOTS_QUERY = gql`
    query GetAvailableSlots($trainerId: Int!, $startDate: String!, $endDate: String!, $slotDurationMinutes: Int) {
        getAvailableSlots(trainerId: $trainerId, startDate: $startDate, endDate: $endDate, slotDurationMinutes: $slotDurationMinutes) {
            start
            end
            label
        }
    }
`

export const CREATE_AVAILABILITY_RULE_MUTATION = gql`
    mutation CreateAvailabilityRule($input: CreateAvailabilityRuleInput!) {
        createAvailabilityRule(input: $input) {
            id
            dayOfWeek
            specificDate
            startTime
            endTime
            isAvailable
            title
            timezone
        }
    }
`

export const UPDATE_AVAILABILITY_RULE_MUTATION = gql`
    mutation UpdateAvailabilityRule($input: UpdateAvailabilityRuleInput!) {
        updateAvailabilityRule(input: $input) {
            id
            startTime
            endTime
            isAvailable
            title
        }
    }
`

export const DELETE_AVAILABILITY_RULE_MUTATION = gql`
    mutation DeleteAvailabilityRule($ruleId: Int!) {
        deleteAvailabilityRule(ruleId: $ruleId)
    }
`

export const ADMIN_GET_DISPUTED_BOOKINGS_QUERY = gql`
    query AdminGetDisputedBookings {
        adminGetDisputedBookings {
            id
            clientId
            client { id name email }
            trainerId
            trainer { id user { id name email } }
            serviceId
            service { id title description priceInIdr }
            status
            paymentType
            fiatAmount
            servicePriceIdr
            processingFeeIdr
            gatewayPaymentMethod
            disputeReason
            scheduledStart
            scheduledEnd
            timezone
            createdAt
            updatedAt
        }
    }
`

export const MY_RESCHEDULE_REQUESTS_QUERY = gql`
    query MyRescheduleRequests {
        myRescheduleRequests {
            id
            bookingId
            proposedById
            originalStart
            originalEnd
            proposedStart
            proposedEnd
            timezone
            status
            createdAt
            updatedAt
        }
    }
`

export const MY_CANCELLATION_REQUESTS_QUERY = gql`
    query MyCancellationRequests {
        myCancellationRequests {
            id
            bookingId
            proposedById
            reason
            status
            createdAt
            updatedAt
        }
    }
`

export const PROPOSE_RESCHEDULE_MUTATION = gql`
    mutation ProposeBookingReschedule($input: ProposeRescheduleInput!) {
        proposeBookingReschedule(input: $input) {
            id
            bookingId
            proposedById
            proposedStart
            proposedEnd
            timezone
            status
            createdAt
        }
    }
`

export const RESOLVE_RESCHEDULE_MUTATION = gql`
    mutation ResolveBookingReschedule($input: ResolveRequestInput!) {
        resolveBookingReschedule(input: $input) {
            id
            bookingId
            status
            updatedAt
        }
    }
`

export const REQUEST_CANCELLATION_MUTATION = gql`
    mutation RequestBookingCancellation($input: RequestCancellationInput!) {
        requestBookingCancellation(input: $input) {
            id
            bookingId
            proposedById
            reason
            status
            createdAt
        }
    }
`

export const RESOLVE_CANCELLATION_MUTATION = gql`
    mutation ResolveBookingCancellation($input: ResolveRequestInput!) {
        resolveBookingCancellation(input: $input) {
            id
            bookingId
            status
            updatedAt
        }
    }
`

export const CREATE_REVIEW_MUTATION = gql`
    mutation CreateReview($input: CreateReviewInput!) {
        createReview(input: $input) {
            id
            bookingId
            rating
            comment
            isAnonymous
            createdAt
        }
    }
`

export const REQUEST_ACCOUNT_DELETION_CODE_MUTATION = gql`
    mutation RequestAccountDeletionCode {
        requestAccountDeletionCode {
            success
            verifyToken
            message
        }
    }
`


export const CONFIRM_ACCOUNT_DELETION_MUTATION = gql`
    mutation ConfirmAccountDeletion($verifyToken: String!, $code: String!) {
        confirmAccountDeletion(verifyToken: $verifyToken, code: $code) {
            success
            message
        }
    }
`

// ─── Blockchain Escrow Transactions ───────────────────────────────────────────

export const REQUEST_BOOKING_DEPOSIT_MUTATION = gql`
    mutation RequestBookingDeposit($bookingId: Int!, $clientWallet: String) {
        requestBookingDeposit(bookingId: $bookingId, clientWallet: $clientWallet) {
            serializedTx
        }
    }
`;

export const REQUEST_RELEASE_MUTATION = gql`
    mutation RequestRelease($bookingId: Int!) {
        requestRelease(bookingId: $bookingId) {
            serializedTx
        }
    }
`;

export const REQUEST_REFUND_MUTATION = gql`
    mutation RequestRefund($bookingId: Int!) {
        requestRefund(bookingId: $bookingId) {
            serializedTx
        }
    }
`;

// ─── Food Persistence (DB-backed) ─────────────────────────────────────────────

export const MY_FAVORITE_FOODS_QUERY = gql`
    query MyFavoriteFoods {
        myFavoriteFoods {
            id
            userId
            foodId
            foodName
            brand
            source
            createdAt
        }
    }
`;

export const MY_MEAL_ITEMS_QUERY = gql`
    query MyMealItems {
        myMealItems {
            id
            userId
            foodId
            foodName
            brand
            source
            servingSize
            nutrientsJson
            addedAt
            updatedAt
        }
    }
`;

export const TOGGLE_FAVORITE_FOOD_MUTATION = gql`
    mutation ToggleFavoriteFood($input: ToggleFavoriteFoodInput!) {
        toggleFavoriteFood(input: $input) {
            id
            userId
            foodId
            foodName
            brand
            source
            createdAt
        }
    }
`;

export const UPSERT_MEAL_ITEM_MUTATION = gql`
    mutation UpsertMealItem($input: UpsertMealItemInput!) {
        upsertMealItem(input: $input) {
            id
            userId
            foodId
            foodName
            brand
            source
            servingSize
            nutrientsJson
            addedAt
            updatedAt
        }
    }
`;

export const REMOVE_MEAL_ITEM_MUTATION = gql`
    mutation RemoveMealItem($id: Int!) {
        removeMealItem(id: $id)
    }
`;

export const CLEAR_MEAL_ITEMS_MUTATION = gql`
    mutation ClearMealItems {
        clearMealItems
    }
`;

