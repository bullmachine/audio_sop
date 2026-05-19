import RoleUser from "../models/RoleUser";
import Role from "../models/Role";
import User from "../models/User";

const RoleUserSeeder = async () => {
    try {
        await RoleUser.deleteMany({});

        const superAdminRole = await Role.findOne({ role: "Super Admin" });
        const operatorRole = await Role.findOne({ role: "Operator" });
        const superAdminUser = await User.findOne({ empCode: "ADMIN001" });
        const operatorUsers = await User.find({ empCode: { $in: ["OP001", "OP002"] } });

        const roleUsers = [
            superAdminRole && superAdminUser
                ? {
                      role: superAdminRole._id,
                      users: [superAdminUser._id],
                      active: true,
                  }
                : null,
            operatorRole && operatorUsers.length
                ? {
                      role: operatorRole._id,
                      users: operatorUsers.map((u) => u._id),
                      active: true,
                  }
                : null,
        ].filter(Boolean);

        if (roleUsers.length) {
            await RoleUser.insertMany(roleUsers);
        }

        // Assign roles directly on user documents
        if (superAdminRole && superAdminUser) {
            await User.findByIdAndUpdate(superAdminUser._id, { role: superAdminRole._id });
        }
        if (operatorRole && operatorUsers.length) {
            await User.updateMany(
                { _id: { $in: operatorUsers.map((u) => u._id) } },
                { role: operatorRole._id }
            );
        }

        console.log("Role-User assignments seeded successfully!");
    } catch (err) {
        console.error("Error seeding role-user assignments:", err);
    }
};

export default RoleUserSeeder;
