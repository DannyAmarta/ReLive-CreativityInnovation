import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UserService } from './user.service';
import { RegisterResponse } from './dto/register-response.type';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // This mutation starts account registration by sending an activation email.
  // It is used by the frontend register form instead of creating an active user immediately.
  @Mutation(() => RegisterResponse)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.register(createUserInput);
  }
}
