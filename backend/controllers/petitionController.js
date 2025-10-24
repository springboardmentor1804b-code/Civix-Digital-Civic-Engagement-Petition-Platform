import Petition from "../models/Petition.js";
import User from "../models/User.js";

// Global time variables needed for the aggregation pipeline (for Trending)
const now = new Date();
const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); 
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); 

// Helper aggregation pipeline steps (factored out for re-use in getPetitions and getTrendingPetitions)
const getTrendingScorePipeline = (twentyFourHoursAgo, sevenDaysAgo) => ([
    {
        $project: {
            title: 1, description: 1, category: 1, location: 1, status: 1, goal: 1, owner: 1, createdAt: 1, signatures: 1,
            signatures_24h: {
                $size: { $filter: { input: "$signatures", as: "sig", cond: { $gte: ["$$sig.signedAt", twentyFourHoursAgo] } } }
            },
            signatures_7d: {
                $size: { $filter: { input: "$signatures", as: "sig", cond: { $gte: ["$$sig.signedAt", sevenDaysAgo] } } }
            },
        }
    },
    {
        $project: {
            title: 1, description: 1, category: 1, location: 1, status: 1, goal: 1, owner: 1, createdAt: 1, signatures: 1,
            trendingScore: {
                $add: [
                    { $multiply: ["$signatures_24h", 3] },
                    { $multiply: ["$signatures_7d", 2] },
                    { $size: "$signatures" },
                ]
            }
        }
    }
]);


// @desc    Get top trending petitions based on recent signatures
// @route   GET /api/petitions/trending
// @access  Public
export const getTrendingPetitions = async (req, res) => {
    try {
        const pipeline = [
            { $match: { status: "Active" } },
            ...getTrendingScorePipeline(twentyFourHoursAgo, sevenDaysAgo),
            { $sort: { trendingScore: -1 } },
            { $limit: 1 }
        ];

        const trendingPetitions = await Petition.aggregate(pipeline);
        await Petition.populate(trendingPetitions, { path: 'owner', select: 'name' });

        return res.status(200).json(trendingPetitions);

    } catch (error) {
        console.error("Error fetching trending petitions:", error);
        return res.status(500).json({ message: "Failed to fetch trending petitions." });
    }
};

// --- MODIFIED FUNCTION: createPetition (Handles File Upload) ---
export const createPetition = async (req, res) => {
  const { title, description, category, signatureGoal, location } = req.body;

    // 💡 FIX: Save the path without a leading slash in the DB
    const enclosurePaths = req.files 
        ? req.files.map(file => {
            // Clean the path (replaces Windows \ with /)
            return file.path.replace(/\\/g, "/"); 
        }) 
        : []; 

  try {
    const newPetition = new Petition({
      title,
      description,
      category,
      location,
      goal: signatureGoal,
      owner: req.user.id,
      enclosures: enclosurePaths, // Save the cleaned public paths (e.g., uploads/filename.jpg)
    });
    const savedPetition = await newPetition.save();
    res.status(201).json(savedPetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- MODIFIED FUNCTION: getPetitions (Returns ALL petitions WITH score) ---
export const getPetitions = async (req, res) => {
  try {
        const pipeline = [
            ...getTrendingScorePipeline(twentyFourHoursAgo, sevenDaysAgo),
            { $sort: { createdAt: -1 } }
        ];

        const petitions = await Petition.aggregate(pipeline);
        
        await Petition.populate(petitions, { path: 'owner', select: 'name' });
        
    res.json(petitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- MODIFIED FUNCTION: signPetition (Handles new schema) ---
export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (petition) {
      if (petition.signatures.some(sig => sig.user && sig.user.equals(req.user.id))) {
        return res
          .status(400)
          .json({ message: "You have already signed this petition" });
      }
      petition.signatures.push({
          user: req.user.id, 
          signedAt: new Date() 
      });

      const updatedPetition = await petition.save();
      res.json(updatedPetition);
    } else {
      res.status(404).json({ message: "Petition not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- MODIFIED FUNCTION: getPetitionById (Ensures enclosures are fetched) ---
export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
        .select('+enclosures')
        .populate("owner", "name");
        
    if (petition) {
      res.json(petition);
    } else {
      res.status(404).json({ message: "Petition not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- EXISTING FUNCTIONS START HERE ---

export const updatePetition = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    petition.title = title || petition.title;
    petition.description = description || petition.description;
    petition.category = category || petition.category;
    const updatedPetition = await petition.save();
    res.json(updatedPetition);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    await petition.deleteOne();
    res.json({ message: "Petition removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetitionsForOfficial = async (req, res) => {
  try {
    const location = req.user.location;
    const petitions = await Petition.find({ location: location })
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(petitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updatePetitionStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const isPublicOfficial =
      req.user?.role === "Public Official" || req.user?.role === "public official";

    if (!isPublicOfficial) {
      if (
        petition.location?.toLowerCase?.() !== req.user?.location?.toLowerCase?.()
      ) {
        return res.status(403).json({
          message: "Not authorized to update petitions in this location.",
        });
      }
    }
    petition.status = status;
    petition.officialResponse = {
      comment: `Status updated to ${status} by an official.`,
      status: status,
      officialId: req.user.id,
      date: new Date(),
    };
    const updatedPetition = await petition.save();
    res.json(updatedPetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};