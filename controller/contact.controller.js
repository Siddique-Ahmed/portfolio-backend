import { sentContactEmail } from "../methods/methods.js";
import { contactModel } from "../models/contact.model.js";
import redis from "../utils/redisClient.js";

// sent mail controller
const sentMail = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, projectType, subject, message } =
      req.body;

    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !projectType ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    await sentContactEmail(
      fullName,
      email,
      phoneNumber,
      projectType,
      subject,
      message
    );

    const contacts = new contactModel({
      fullName,
      email,
      phoneNumber,
      projectType,
      subject,
      message,
    });

    await contacts.save();
    await redis.del("contacts");

    return res.status(200).json({
      message: "Contact form submitted successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// get mail controller
const getMail = async (_, res) => {
  try {
    const contacts = await redis.get("contacts");

    if (contacts) {
      return res.status(200).json({
        message: "Contacts fetched successfully!",
        success: true,
      });
    }

    const allContacts = await contactModel.find();

    if (!allContacts && allContacts.length === 0) {
      return res.status(404).json({
        message: "No contacts found!",
        success: false,
      });
    }

    await redis.set("contacts", JSON.stringify(allContacts));

    return res.status(200).json({
      message: "Contacts found successfully!",
      success: true,
      data: allContacts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// get mail by id controller
const getMailById = async (req, res) => {
  try {
    const contactId = req.params.id;

    const contact = await redis.get(`contacts/${contactId}`);

    if (contact) {
      return res.status(200).json({
        message: "Contact found successfully!",
        success: true,
        data: JSON.parse(contact),
      });
    }

    const contactData = await contactModel.findById(contactId);

    if (!contactData) {
      return res.status(404).json({
        message: "Contact not found!",
        success: false,
      });
    }

    await redis.set(`contacts/${contactId}`, JSON.stringify(contactData));
    return res.status(200).json({
      message: "Contact found successfully!",
      success: true,
      data: contactData,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// delete mail controller
const deleteMail = async (req, res) => {
  try {
    const contactId = req.params.id;

    const contact = await contactModel.findByIdAndDelete(contactId);
    await redis.del(`contacts/${contactId}`);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found!",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Contact deleted successfully!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export { sentMail, getMail, getMailById, deleteMail };
