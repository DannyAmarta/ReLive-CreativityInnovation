import gql from 'graphql-tag';

export const CREATE_USER_MUTATION = gql`
    mutation createUser($input: CreateUserInput!){
        createUser(createUserInput: $input){
            id
        }
    }
`;