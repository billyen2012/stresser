declare class Random {
  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  number(min: number, max: number): number;
  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  integer(min: number, max: number): number;
  /**
   * Returns an random item from an array
   */
  arrayItem<T>(items: T): T[number];

  /**
   * Return a random string
   */
  string(strLength?: number, characters?: string): string;
  /**
   * Return a phone number by preset format
   *
   * ```js
   * // e.g.
   * phoneNum('+1xxx-xxx-xxxx')
   * ```
   */
  phoneNum(format: string): string;
  /**
   * Return a random email
   */
  email(options: {
    domainList?: string[];
    useRandomString?: boolean;
    username?: string;
  }): string;
  /**
   * Return a random person name
   *
   * ```js
   * name() // Jon Doe
   * ```
   */
  name(): string;
  /**
   * Return a random birthday (in `xxxx-xx-xx` format)
   */
  birthday(minAge?: number, maxAge?: number): string;
  /**
   * Return true or false
   */
  boolean(): boolean;
}

declare class DataGenerator {
  random: Random;
  /**
   * Return a uuid v4
   */
  uuidV4(): string;
  /**
   * Return random users in an array
   */
  users(
    count?: number,
    options: {
      integerId?: boolean;
      emailDomainList?: string[];
      birthdayMaxAge?: number;
      birthdayMinAge?: number;
      addressPostalCodeFormat?: string;
      phoneNumFormat?: string;
    }
  ): {
    id: number | string;
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    phone: string;
    address: {
      street1: string;
      street2: string;
      postalCode: string;
    };
  }[];
}

export default DataGenerator;
