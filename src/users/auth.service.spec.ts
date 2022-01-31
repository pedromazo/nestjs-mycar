import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        //create a fake copy of the users service
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email)
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 99999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        };
    
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile(); //create DI container
    
        service = module.get(AuthService);
    });
    
    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
       const user = await service.signup('asdf@asdf.com', 'asdf');

       expect(user.password).not.toEqual('asdf');
       const [salt, hash] = user.password.split('.');
       expect(salt).toBeDefined();
       expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
        await service.signup('a@f.com', 'asdf');
        expect.assertions(2);
        try{
            await service.signup('a@f.com', 'asdf')
        } catch (err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toBe('email already in use');
        }

    });

    it('throws if signin is called with an unused email', async () => {
        expect.assertions(2);
        try {
            await service.signin('a@a.com', 'asdf')
        } catch (err) {
            expect(err).toBeInstanceOf(NotFoundException);
            expect(err.message).toBe('user not found')
        }
    })

    it('throws if an invalid password is provided', async () => {
        await service.signup('asdfff@a.com', 'asd')
        expect.assertions(2);
        try {
            await service.signin('asdfff@a.com', 'a')
        } catch(err) {
            expect(err).toBeInstanceOf(BadRequestException);
            expect(err.message).toBe('bad password')
        }

    })

    it('returns a user if password provided is correct', async () => {
        await service.signup('asdf@asdf.com', 'mypassword');
        const user = await service.signin('asdf@asdf.com', 'mypassword');

        // const user = await service.signin('asdf@asdf.com', 'mypassword');
        expect(user).toBeDefined();
    })
});

