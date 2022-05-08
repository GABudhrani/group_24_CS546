module.exports = {
    checkField(fieldName, fieldValue) {
        if (!fieldValue) throw `Error: You must supply a ${fieldName}!`;
        if (typeof fieldValue !== 'string') throw `Error: ${fieldName} must be a string!`;
        fieldValue = fieldValue.trim();
        if (fieldValue.length === 0)
            throw `Error: ${fieldName} cannot be an empty string or string with just spaces`;
        if (fieldValue.includes(' ')) {
            throw `Error: ${fieldName} should not contain any spaces`;
        }
        fieldValue = fieldValue.toLowerCase();
        return fieldValue;
    },

    checkEmail(email) {
        if (!email) throw `Error: You must supply an email}!`;
        if (typeof email !== 'string') throw `Error: email must be a string!`;
        email = email.trim();
        if (email.length === 0)
            throw `Error: email cannot be an empty string or string with just spaces`;
        if (email.includes(' ')) {
            throw `Error: email should not contain any spaces`;
        }
        if (!this.validateEmail(email)) {
            throw `Error: Enter a valid email`
        }
        email = email.toLowerCase();
        return email;
    },

    validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },

    checkPassword(password) {
        if (!password) throw `Error: You must supply a password!`;
        if (typeof password !== 'string') throw `Error: password must be a string!`;
        password = password.trim();
        if (password.length === 0)
            throw `Error: Password cannot be an empty string or string with just spaces`;
        if (password.length < 6)
            throw `Error: Password should be atleat 6 characters long`;
        if (password.includes(' ')) {
            throw 'Error: Password should not contain any spaces';
        }
        return password;
    }
};