
import { expect, it, describe } from "@jest/globals";
import { isCacheable } from "../src/isCacheable";


describe('isCacheable', () => {

    it('allows caching of simple values', () => {
        expect(isCacheable('a string')).toBeTruthy();
        expect(isCacheable(1000)).toBeTruthy();
        expect(isCacheable(null)).toBeTruthy();
        expect(isCacheable(true)).toBeTruthy();
        expect(isCacheable(false)).toBeTruthy();
    });

    it ('does not allow caching of looping values', () => {
        type User = {name: string, id: number, users: User[]}
        const user : User = {name: 'Bob', id: 100, users: []};
        const user2: User  = {name: 'Sue', id: 200, users: []};

        const users = [user, user2];
        user.users = users;
        user2.users = users;

        expect(isCacheable(users)).toBeFalsy();

        expect(isCacheable(() => {})).toBeFalsy();
    }); 
});