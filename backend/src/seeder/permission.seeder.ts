import Permission from "../models/Permission";

const PermissionSeeder = async () => {
    try {
        await Permission.deleteMany({});

        const permissions = [
            // User Management
            { 
                name: "User View", 
                description: "View list of users",
                module: "User", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "User List", 
                description: "Read list of users",
                module: "User", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Create", 
                description: "Create new users",
                module: "User", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Update", 
                description: "Update existing users",
                module: "User", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Delete", 
                description: "Delete users",
                module: "User", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Role Management
            { 
                name: "Role View", 
                description: "View list of roles",
                module: "Role", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Role List", 
                description: "Read list of roles",
                module: "Role", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role Create", 
                description: "Create new roles",
                module: "Role", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role Update", 
                description: "Update existing roles",
                module: "Role", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role Delete", 
                description: "Delete roles",
                module: "Role", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Permission Management
            { 
                name: "Permission View", 
                description: "View list of permissions",
                module: "Permission", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Permission List", 
                description: "Read list of permissions",
                module: "Permission", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Permission Create", 
                description: "Create new permissions",
                module: "Permission", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Permission Update", 
                description: "Update existing permissions",
                module: "Permission", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Permission Delete", 
                description: "Delete permissions",
                module: "Permission", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Role User Management
            { 
                name: "Role User View", 
                description: "View list of role users",
                module: "Role User", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Role User List", 
                description: "Read list of role users",
                module: "Role User", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role User Create", 
                description: "Assign users to roles",
                module: "Role User", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role User Update", 
                description: "Update role user assignments",
                module: "Role User", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Role User Delete", 
                description: "Remove users from roles",
                module: "Role User", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Level Management
            { 
                name: "Level View", 
                description: "View list of levels",
                module: "Level", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Level List", 
                description: "Read list of levels",
                module: "Level", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Create", 
                description: "Create new levels",
                module: "Level", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Update", 
                description: "Update existing levels",
                module: "Level", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Delete", 
                description: "Delete levels",
                module: "Level", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Level Role Management
            { 
                name: "Level Role View", 
                description: "View list of level roles",
                module: "Level Role", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Level Role List", 
                description: "Read list of level roles",
                module: "Level Role", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Role Create", 
                description: "Create new level role assignments",
                module: "Level Role", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Role Update", 
                description: "Update existing level role assignments",
                module: "Level Role", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Level Role Delete", 
                description: "Delete level role assignments",
                module: "Level Role", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Process Rate Management
            { 
                name: "Process Rate View", 
                description: "View list of process rates",
                module: "Process Rate", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Process Rate List", 
                description: "Read list of process rates",
                module: "Process Rate", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Rate Create", 
                description: "Create new process rates",
                module: "Process Rate", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Rate Update", 
                description: "Update existing process rates",
                module: "Process Rate", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Rate Delete", 
                description: "Delete process rates",
                module: "Process Rate", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Process Management
            { 
                name: "Process View", 
                description: "View list of processes",
                module: "Process", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Process List", 
                description: "Read list of processes",
                module: "Process", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Create", 
                description: "Create new processes",
                module: "Process", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Update", 
                description: "Update existing processes",
                module: "Process", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Process Delete", 
                description: "Delete processes",
                module: "Process", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // Request Management
            { 
                name: "Request View", 
                description: "View list of requests",
                module: "Request", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "Request List", 
                description: "Read list of requests",
                module: "Request", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Request Create", 
                description: "Create new requests",
                module: "Request", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Request Update", 
                description: "Update existing requests",
                module: "Request", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "Request Delete", 
                description: "Delete requests",
                module: "Request", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // History Management
            { 
                name: "History View", 
                description: "View list of cost history",
                module: "History", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "History List", 
                description: "Read list of cost history",
                module: "History", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "History Create", 
                description: "Upload new cost history records",
                module: "History", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "History Update", 
                description: "Update existing cost history",
                module: "History", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "History Delete", 
                description: "Delete cost history records",
                module: "History", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },

            // User Permissions Management
            { 
                name: "User Permissions View", 
                description: "View list of user permissions",
                module: "User Permissions", 
                action: "view", 
                isHeading: true, 
                active: true 
            },
            { 
                name: "User Permissions List", 
                description: "Read list of user permissions",
                module: "User Permissions", 
                action: "read", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Permissions Create", 
                description: "Create new user permissions",
                module: "User Permissions", 
                action: "create", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Permissions Update", 
                description: "Update existing user permissions",
                module: "User Permissions", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
            { 
                name: "User Permissions Delete", 
                description: "Delete user permissions",
                module: "User Permissions", 
                action: "delete", 
                isHeading: false, 
                active: true 
            },
             { 
                name: "Costing Update", 
                description: "Update existing costing",
                module: "Costing", 
                action: "update", 
                isHeading: false, 
                active: true 
            },
        ];

        // Insert permissions into the database
        await Permission.insertMany(permissions);

        console.log('Permissions seeded successfully!');
    } catch (err) {
        console.error('Error seeding permissions:', err);
    }
};

export default PermissionSeeder;
