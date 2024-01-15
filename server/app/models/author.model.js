module.exports = (sequelize, Sequelize) => {
    const Author = sequelize.define("Author", {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        }
    });

    // Virtual for author's full name
    Author.prototype.fullName = function() {
        let fullName = "";
        if (this.firstName && this.lastName) {
            fullName = `${this.lastName}, ${this.firstName}`;
        }
        return fullName;
    };

    // Virtual for author's URL
    Author.prototype.getUrl = function() {
        return `/catalog/author/${this.id}`;
    };

    return Author;
};
