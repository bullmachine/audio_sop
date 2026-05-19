import Role from "../models/Role";

const RoleSeeder = async () => {
    try {
        await Role.deleteMany({});

        const roles = [
            {
                role: "Super Admin",
                description: "Full system access - manages operators, products, stages, and audio assignments",
                status: true,
            },
            {
                role: "Operator",
                description: "Operator access - view assigned audio SOP files only",
                status: true,
            },
        ];

        await Role.insertMany(roles);
        console.log("Roles seeded successfully!");
    } catch (err) {
        console.error("Error seeding roles:", err);
    }
};

export default RoleSeeder;
