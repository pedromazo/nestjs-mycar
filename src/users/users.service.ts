import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(User) private repo: Repository<User>) {}

        create(email: string, password: string) {
            const user = this.repo.create({ email, password});
            return this.repo.save(user)
        }

        findOne(id: number) {
            if(!id) {
                return null;
            }
            const user = this.repo.findOne(id)
            return user;

        }

        find(email: string) {
            const users = this.repo.find({ email });
            return users;
        }


        async update(id: number, attrs: Partial<User>) {
            const user = await this.findOne(id);
            if(!user) {
                throw new NotFoundException('User not found');
            }
            Object.assign(user, attrs); //take all properties of attrs and apply to user;
            return this.repo.save(user);

        }

        async remove(id: number) {
            const user = await this.findOne(id);
            if(!user) {
                throw new NotFoundException ('User not found');
            }
            return this.repo.remove(user);
        }
}
