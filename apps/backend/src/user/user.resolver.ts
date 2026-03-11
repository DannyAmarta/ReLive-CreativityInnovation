import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserService } from './user.service';
import { RegisterResponse } from './dto/register-response.type';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => RegisterResponse)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    return await this.userService.register(createUserInput);
  }
}
