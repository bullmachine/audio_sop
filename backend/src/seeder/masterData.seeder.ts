import Product from "../models/Product";
import Stage from "../models/Stage";
import Language from "../models/Language";

export const MasterDataSeeder = async () => {
    try {
        await Product.deleteMany({});
        await Stage.deleteMany({});
        await Language.deleteMany({});

        const products = [
            { name: "KMAT-1", description: "KMAT Product 1" },
            { name: "KMAT-2", description: "KMAT Product 2" },
            { name: "KMAT-3", description: "KMAT Product 3" },
        ];

        const stages = [
            { stage: "Stage-1", stage_description: "Assembly Stage 1" },
            { stage: "Stage-2", stage_description: "Assembly Stage 2" },
            { stage: "Stage-3", stage_description: "Assembly Stage 3" },
        ];

        const languages = [
            { language: "English" },
            { language: "Hindi" },
            { language: "Tamil" },
        ];

        await Product.insertMany(products);
        await Stage.insertMany(stages);
        await Language.insertMany(languages);

        console.log("Master data (products, stages, languages) seeded successfully!");
    } catch (err) {
        console.error("Error seeding master data:", err);
    }
};

export default MasterDataSeeder;
