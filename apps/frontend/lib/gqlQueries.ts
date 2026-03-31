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
            bio
            avatar
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

export const GET_SET_PERFORMANCE_ANALYTICS_QUERY = gql`
    query GetSetPerformanceAnalytics($exerciseId: String!, $days: Int!) {
        setPerformanceAnalytics(exerciseId: $exerciseId, days: $days) {
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
