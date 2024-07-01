import { firstNameList } from "./data/firstNameList.js";
import { lastNameList } from "./data/lastNameList.js";

class Random {
  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  number(min, max) {
    return Math.random() * (max - min) + min;
  }
  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  integer(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  /**
   * Return random item in an array
   * @param {any[]} items
   * @returns {any}
   */
  arrayItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
  /**
   * Return a random string
   */
  string(
    strLength = 8,
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ) {
    if (typeof characters !== "string") {
      throw new Error("characters must be an string");
    }
    let str = "";
    const charsAmount = characters.length;
    for (let i = 0; i < strLength; i++) {
      str += characters.charAt(Math.floor(Math.random() * charsAmount));
    }
    return str;
  }
  /**
   * Return a phone number by preset format
   *
   * ```js
   * // e.g.
   * phoneNum('+1xxx-xxx-xxxx')
   * ```
   * @param {string} [format]
   * @returns
   */
  phoneNum(format = "") {
    return String(format).replace(/[x]/g, (v) => {
      if (v.toLocaleLowerCase() === "x") {
        return String(this.integer(0, 9));
      }
    });
  }
  /**
   * Return a random email
   *
   * @param {{
   *  domainList?:string[];
   *  useRandomString?:boolean
   *  username?:string;
   * }} param0
   * @returns
   */
  email({ domainList = [], username = "", useRandomString = false } = {}) {
    const domain =
      domainList.length > 0
        ? this.arrayItem(domainList)
        : `${this.string(3).toLocaleLowerCase()}.${this.arrayItem([
            "org",
            "com",
            "edu",
          ])}`;

    if (username) {
      return username + "@" + domain;
    }

    return useRandomString
      ? this.string(5).toLocaleLowerCase() +
          "." +
          this.string(5).toLocaleLowerCase() +
          "@" +
          domain
      : this.name().replace(" ", ".").toLocaleLowerCase() + "@" + domain;
  }
  /**
   * will return a random person name
   *
   * ```js
   * name() // Jon Doe
   * ```
   */
  name() {
    return this.arrayItem(firstNameList) + " " + this.arrayItem(lastNameList);
  }
  /**
   * will return a random birthday
   *
   * ```js
   * name() // Jon Doe
   * ```
   */
  birthday(minAge = 18, maxAge = 70) {
    const yearEpoch = 31536e6;
    const date = new Date(
      new Date().valueOf() - this.number(minAge * yearEpoch, maxAge * yearEpoch)
    );
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  /**
   * will return true or false
   * ```js
   * name() // Jon Doe
   * ```
   */
  boolean() {
    return this.arrayItem([true, false]);
  }
}

export default class DataGenerator {
  constructor() {
    this.random = new Random();
  }
  uuidV4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  users(
    count = 1,
    {
      integerId = false,
      emailDomainList = [],
      birthdayMaxAge = 18,
      birthdayMinAge = 70,
      addressPostalCodeFormat = "xxxxx",
      phoneNumFormat = "xxx-xxx-xxxx",
    } = {}
  ) {
    let users = [];
    for (let i = 0; i < count; i++) {
      const name = this.random.name();
      const [firstName, lastName] = name.split(" ");
      users.push({
        id: integerId ? i + 1 : this.uuidV4(),
        firstName,
        lastName,
        email: this.random.email({
          domainList: emailDomainList,
          username: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}`,
        }),
        birthday: this.random.birthday(birthdayMinAge, birthdayMaxAge),
        phone: this.random.phoneNum(phoneNumFormat),
        address: {
          street1: this.random.string(8),
          street2: this.random.boolean()
            ? `${this.random.arrayItem([
                "build. ",
                "apt. ",
                "#",
                "No. ",
              ])}${this.random.integer(1, 13)}`
            : "",
          postalCode: this.random.phoneNum(addressPostalCodeFormat),
        },
      });
    }
    return users;
  }
}
