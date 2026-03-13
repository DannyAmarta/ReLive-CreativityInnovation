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
