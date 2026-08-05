import mongoose from 'mongoose';
import { APPLICATION_STATUS, STAGES } from '../constants.js';

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(APPLICATION_STATUS), required: true },
    date: { type: Date, default: Date.now },
    byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, default: '' },
  },
  { _id: false },
);

const geometryVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    areaM2: { type: Number, required: true },
    authorType: { type: String, enum: ['business', 'admin'], required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeNote: { type: String, default: '' },
    acceptedByBusiness: { type: Boolean, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const stageRecordSchema = new mongoose.Schema(
  {
    stage: { type: String, enum: STAGES, required: true },
    assigneeRole: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'approved_with_changes', 'rejected', 'info_requested'],
      default: 'pending',
    },
    resolutionNote: { type: String, default: '' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, unique: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    hududId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', required: true },
    purposeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purpose', required: true },
    purpose: { type: String, required: true },
    usageType: { type: String, required: true },
    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    comment: { type: String, default: '' },
    address: { type: String, default: '' },
    cadastreNumber: { type: String, trim: true, default: '' },

    geometry: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    areaM2: { type: Number, required: true },
    geometryVersions: { type: [geometryVersionSchema], default: [] },

    photos: {
      shimol: { type: String, default: null },
      janub: { type: String, default: null },
      sharq: { type: String, default: null },
      gharb: { type: String, default: null },
    },

    currentStage: { type: String, enum: [...STAGES, null], default: 'cadastre' },
    pendingStage: { type: String, enum: [...STAGES, null], default: null },
    stages: { type: [stageRecordSchema], default: [] },

    priceSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },

    status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.IN_REVIEW_CADASTRE },
    history: { type: [historyEntrySchema], default: [] },
    attachments: { type: [String], default: [] },

    // Kadastr bosqichida biriktiriladi
    locationSchemeFile: { type: String, default: null },
    // Arxitektura bosqichida biriktiriladi
    designCodeFile: { type: String, default: null },
  },
  { timestamps: true },
);

applicationSchema.index({ geometry: '2dsphere' });

export default mongoose.model('Application', applicationSchema);
