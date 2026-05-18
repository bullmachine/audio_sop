import mongoose from 'mongoose';
import UserSeeder from './user.seeder';   
import RoleSeeder from './role.seeder';
import PermissionSeeder from './permission.seeder';
import RoleUserSeeder from './roleUser.seeder';
import UserPermissionSeeder from './userPermission.seeder';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';
      

const seedAll = async (): Promise<void> => {
    try { 
        if (mongoose.connection.readyState === 0) {
            console.log("Waiting for MongoDB connection...");
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rate-approval');
        } 
        await new Promise(resolve => setTimeout(resolve, 1000));  

        console.log('Using existing MongoDB connection for seeding');
 
        await UserSeeder();
        await RoleSeeder();
        await PermissionSeeder();
        await RoleUserSeeder();
        await UserPermissionSeeder(); 
        // await ProcessSeeder.seedProcesses();
        // await RequestSeeder.seedRequests();
        // await ProcessRateSeeder.seedProcessRates();
 
        console.log("\n=== VERIFICATION ===");
        const userCount = await User.countDocuments();
        const roleCount = await Role.countDocuments();
        const permissionCount = await Permission.countDocuments();  
        console.log(`Total users seeded: ${userCount}`);
        console.log(`Total roles seeded: ${roleCount}`);
        console.log(`Total permissions seeded: ${permissionCount}`); 

        console.log("All seeders executed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
};
 
seedAll();
