import { Body, Controller, Get, Post } from '@nestjs/common';
import { SetService } from './set.service';
import { CalculateSetInput } from './dto/calculate-set.input';

@Controller('api/sets')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Get('exercises')
  getExercises() {
    return this.setService.getExercises();
  }

  @Post('calculate')
  calculate(@Body() input: CalculateSetInput) {
    return this.setService.calculate(input);
  }
}
