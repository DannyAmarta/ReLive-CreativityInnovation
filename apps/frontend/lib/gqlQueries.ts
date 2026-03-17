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

export const FORGOT_PASSWORD = gql`
    mutation ForgotPassword($input: ForgotPasswordDto!){
        forgotPassword(forgotInput: $input){
            message
        }
    }
`

export const RESET_PASSWORD = gql`
    mutation resetPassword($input: ResetPasswordDto!) {
        resetPassword(resetInput: $input) {
            message
        }
    }
`

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
