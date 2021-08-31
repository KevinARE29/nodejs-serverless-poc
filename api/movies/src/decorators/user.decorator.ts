import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import jwt_decode from 'jwt-decode'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    try {
      const token = req.headers.authorization?.split(' ')[1]

      return jwt_decode(token)
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  },
)
