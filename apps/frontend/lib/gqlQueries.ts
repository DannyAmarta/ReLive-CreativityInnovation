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
export const CREATE_USER_MUTATION = gql`
    mutation createUser($input: CreateUserInput!){
        createUser(createUserInput: $input){
            id
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