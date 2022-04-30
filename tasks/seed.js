const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;

async function main() {

    const db = await dbConnection.connectToDb();
    await db.dropDatabase();

    try {
        // const shri = await users.createUser("Sh1ri","standard");
        // console.log(shri);

        // const shri2 = await users.createUser("shri","standard");
        // console.log(shri2);
        // const check = await users.checkUser("sH1ri","standard");
        // console.log(check);
    } catch (error) {
        console.log(error)
    }

    // try {
    //     const shri = await users.createUser("ks122","123");
    //     console.log(shri);
    // } catch (error) {
    //     console.log(error)
    // }


    console.log('Done seeding database');

    await dbConnection.closeConnection();

}

main();
