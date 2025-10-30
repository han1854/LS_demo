const base = require('./file.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Upload operations
    uploadLessonMaterial: base.uploadLessonMaterial || noopNotImpl('uploadLessonMaterial'),
    uploadAssignmentFiles: base.uploadAssignmentFiles || noopNotImpl('uploadAssignmentFiles'),
    uploadSubmissionFiles: base.uploadSubmissionFiles || noopNotImpl('uploadSubmissionFiles'),

    // File access
    getLessonFiles: base.getLessonFiles || noopNotImpl('getLessonFiles'),
    getAssignmentFiles: base.getAssignmentFiles || noopNotImpl('getAssignmentFiles'),
    getSubmissionFiles: base.getSubmissionFiles || noopNotImpl('getSubmissionFiles'),

    // Download operations
    downloadFile: base.downloadFile || noopNotImpl('downloadFile'),
    downloadMultipleFiles: base.downloadMultipleFiles || noopNotImpl('downloadMultipleFiles'),

    // File management
    renameFile: base.renameFile || noopNotImpl('renameFile'),
    moveFile: base.moveFile || noopNotImpl('moveFile'),
    deleteFile: base.deleteFile || noopNotImpl('deleteFile'),
    deleteMultipleFiles: base.deleteMultipleFiles || noopNotImpl('deleteMultipleFiles'),

    // Metadata operations
    getFileMetadata: base.getFileMetadata || noopNotImpl('getFileMetadata'),
    updateFileMetadata: base.updateFileMetadata || noopNotImpl('updateFileMetadata'),

    // Access control
    updateFilePermissions: base.updateFilePermissions || noopNotImpl('updateFilePermissions'),
    getFilePermissions: base.getFilePermissions || noopNotImpl('getFilePermissions'),

    // Preview & thumbnails
    previewFile: base.previewFile || noopNotImpl('previewFile'),
    getFileThumbnail: base.getFileThumbnail || noopNotImpl('getFileThumbnail'),

    // Analytics
    getStorageUsageAnalytics: base.getStorageUsageAnalytics || noopNotImpl('getStorageUsageAnalytics'),
    getDownloadAnalytics: base.getDownloadAnalytics || noopNotImpl('getDownloadAnalytics'),

    // Security scanning
    scanFile: base.scanFile || noopNotImpl('scanFile'),
    getFileScanResults: base.getFileScanResults || noopNotImpl('getFileScanResults')
};

module.exports = compat;