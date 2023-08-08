import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

export class BasicAuthGuard implements CanActivate {

    private readonly authKey = process.env.AUTH_KEY!;
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers['authorization'];
        // No authorization header
        if (!authorization) {
            throw new UnauthorizedException('Authorization header not found.');
        }
        // Check credentials
        if (this.authKey === authorization) {
            return true;
        }
        throw new UnauthorizedException();
    }
}
