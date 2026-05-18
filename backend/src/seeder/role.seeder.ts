import Role from "../models/Role";

const RoleSeeder = async () => {
    try {
        await Role.deleteMany({});

        const roles = [
            { 
                role: "Super Admin", 
                description: "Full system access with all permissions",
                status: true 
            },
            { 
                role: "Production & MED", 
                description: "Production & MED access with most permissions",
                status: true 
            },
            { 
                role: "IED", 
                description: "IED access with limited administrative permissions",
                status: true 
            },
            { 
                role: "MED Head", 
                description: "MED Head access with limited administrative permissions",
                status: true 
            },
            { 
                role: "Costing", 
                description: "Costing access with limited permissions",
                status: true 
            },
            { 
                role: "Sourcing", 
                description: "Sourcing access with limited permissions",
                status: true 
            },
            { 
                role: "Operation Head", 
                description: "Operation Head access with limited permissions",
                status: true 
            },
            { 
                role: "Project Head", 
                description: "Project Head access with limited permissions",
                status: true 
            },
            { 
                role: "Managing Director", 
                description: "Managing Director access with limited permissions",
                status: true 
            },
        ];

        // Insert roles into the database
        await Role.insertMany(roles);

        console.log('Roles seeded successfully!');
    } catch (err) {
        console.error('Error seeding roles:', err);
    }
};

export default RoleSeeder;
