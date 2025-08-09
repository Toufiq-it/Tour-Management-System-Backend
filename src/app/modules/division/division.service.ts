import { IDivision } from "./division.interface";
import { Division } from "./division.model";


// create Division
const createDivision = async (payload: IDivision) => {
    
    const existingDivision = await Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("A division with this name already exists.");
    }

    const baseSlug = payload.name.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-division`;
    console.log(slug);
    
    let counter = 0;
    while(await Division.exists({slug})){
        slug = `${slug}-${counter++}`; // dhaka-division-1
    }

    payload.slug = slug;

    const division = await Division.create(payload);

    return division;
};

// Get all division
const getAllDivision = async () =>{
    const divisions = await Division.find({});

    const totalDivision = await Division.countDocuments();

    return {
        data: divisions,
        meta: {
            total : totalDivision
        }
    }
};

// single division
const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });
    return {
        data: division,
    }
};

// update division
const updateDivision = async (id: string, payload: Partial<IDivision>) => {

    const existingDivision = await Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    }

    const duplicateDivision = await Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });

    if (duplicateDivision) {
        throw new Error("A division with this name already exists.");
    }

    if (payload.name) {
        const baseSlug = payload.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        payload.slug = slug
    }

    const updatedDivision = await Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    return updatedDivision
};

// delete division
const deleteDivision = async (id: string) => {
    await Division.findByIdAndDelete(id);
    return null;
};

export const DivisionService = {
    createDivision,
    getAllDivision,
    getSingleDivision,
    updateDivision,
    deleteDivision,
}