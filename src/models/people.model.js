import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const peopleSchema = new Schema(
  {
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    company: {
      type: Types.ObjectId,
      required: false,
    },
    dateOfBirth: {
      type: Types.Date,
      required: false,
    },
    email: {
      type: Types.String,
      required: false,
    },
    fullName: {
      type: Types.String,
      required: false,
    },
    preferredAgents: {
      required: false,
      type: [Types.Mixed],
    },
    identification: {
      type: String,
      required: false,
    },
    identificationType: {
      type: String,
      required: false,
    },
    integrationId: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    numberCountryCode: {
      type: String,
      required: false,
    },
    postalCode: {
      type: String,
      required: false,
    },
    extraFields: [
      {
        label: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const People = mongoose.model("People", peopleSchema, "people");

export default People;