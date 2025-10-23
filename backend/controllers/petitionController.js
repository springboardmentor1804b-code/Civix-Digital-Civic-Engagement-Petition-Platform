import Petition from "../models/Petition.js";
import User from "../models/User.js";

// --- Existing Functions (No Changes Needed) ---

export const createPetition = async (req, res) => {
  const { title, description, category, signatureGoal, location } = req.body;
  try {
    const newPetition = new Petition({
      title,
      description,
      category,
      location,
      goal: signatureGoal,
      owner: req.user.id,
    });
    const savedPetition = await newPetition.save();
    res.status(201).json(savedPetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find({})
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(petitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (petition) {
      if (petition.signatures.includes(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You have already signed this petition" });
      }
      petition.signatures.push(req.user.id);
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

export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id).populate(
      "owner",
      "name"
    );
    if (petition) {
      res.json(petition);
    } else {
      res.status(404).json({ message: "Petition not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

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

// @desc    Update the status of a petition by an official
// @route   PUT /api/petitions/:id/status
// @access  Private/Official
export const updatePetitionStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // Allow "Public Official" to update across any location; otherwise enforce same-location policy.
    const isPublicOfficial =
      req.user?.role === "Public Official" || req.user?.role === "public official";

    if (!isPublicOfficial) {
      // Case-insensitive location comparison for other officials
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
