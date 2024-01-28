module.exports = (sequelize, Sequelize) => {
    const BookInstance = sequelize.define("BookInstance", {
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "Maintenance",
            validate: {
                isIn: [["Available", "Maintenance", "Loaned", "Reserved"]]
            }
        },
        dueBack: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        numberOfCopies: {
          type: Sequelize.INTEGER,
          defaultValue: '1'
        },
    });

    // Virtual for bookinstance's URL
    BookInstance.prototype.getUrl = function () {
        return `/catalog/bookinstance/${this.id}`;
    };

    return BookInstance;
};
