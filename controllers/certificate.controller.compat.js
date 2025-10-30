const base = require('./certificate.controller');
const { User, Course, Certificate } = require('../models');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Generation
    generateCertificate: base.generateCertificate || noopNotImpl('generateCertificate'),
    generateBatchCertificates: base.generateBatchCertificates || noopNotImpl('generateBatchCertificates'),

    // Management
    issueCertificate: base.issueCertificate || noopNotImpl('issueCertificate'),
    revokeCertificate: base.revokeCertificate || noopNotImpl('revokeCertificate'),
    reissueCertificate: base.reissueCertificate || noopNotImpl('reissueCertificate'),

    // Access
    getMyCertificates: base.getMyCertificates || noopNotImpl('getMyCertificates'),
    getCertificateDetails: base.getCertificateDetails || noopNotImpl('getCertificateDetails'),
    downloadCertificate: base.downloadCertificate || noopNotImpl('downloadCertificate'),

    // Verification
    verifyCertificate: base.verifyCertificate || noopNotImpl('verifyCertificate'),
    getCertificateVerificationDetails: base.getCertificateVerificationDetails || noopNotImpl('getCertificateVerificationDetails'),

    // Templates
    getCertificateTemplates: base.getCertificateTemplates || noopNotImpl('getCertificateTemplates'),
    createCertificateTemplate: base.createCertificateTemplate || noopNotImpl('createCertificateTemplate'),
    updateCertificateTemplate: base.updateCertificateTemplate || noopNotImpl('updateCertificateTemplate'),

    // Analytics
    getCertificateAnalytics: base.getCertificateAnalytics || noopNotImpl('getCertificateAnalytics'),
    getCourseCertificateStats: base.getCourseCertificateStats || noopNotImpl('getCourseCertificateStats'),

    // History
    getCertificateHistory: base.getCertificateHistory || noopNotImpl('getCertificateHistory'),

    // Bulk Operations
    bulkVerifyCertificates: base.bulkVerifyCertificates || noopNotImpl('bulkVerifyCertificates'),
    bulkRevokeCertificates: base.bulkRevokeCertificates || noopNotImpl('bulkRevokeCertificates')
};

module.exports = compat;