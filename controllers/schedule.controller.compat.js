const base = require('./schedule.controller');

const noopNotImpl = (name) => (req, res) => res.status(501).json({ message: `Not implemented: ${name}` });

const compat = {
    // Schedule Creation
    createSchedule: base.createSchedule || noopNotImpl('createSchedule'),
    createRecurringSchedule: base.createRecurringSchedule || noopNotImpl('createRecurringSchedule'),

    // Schedule Management
    updateSchedule: base.updateSchedule || noopNotImpl('updateSchedule'),
    deleteSchedule: base.deleteSchedule || noopNotImpl('deleteSchedule'),

    // Status Management
    cancelSchedule: base.cancelSchedule || noopNotImpl('cancelSchedule'),
    rescheduleSession: base.rescheduleSession || noopNotImpl('rescheduleSession'),
    markSessionComplete: base.markSessionComplete || noopNotImpl('markSessionComplete'),

    // Schedule Retrieval
    getMySchedule: base.getMySchedule || noopNotImpl('getMySchedule'),
    getCourseSchedule: base.getCourseSchedule || noopNotImpl('getCourseSchedule'),
    getInstructorSchedule: base.getInstructorSchedule || noopNotImpl('getInstructorSchedule'),

    // Search & Filter
    searchSchedules: base.searchSchedules || noopNotImpl('searchSchedules'),
    getAvailableSlots: base.getAvailableSlots || noopNotImpl('getAvailableSlots'),

    // Attendance
    recordAttendance: base.recordAttendance || noopNotImpl('recordAttendance'),
    getSessionAttendance: base.getSessionAttendance || noopNotImpl('getSessionAttendance'),
    updateAttendance: base.updateAttendance || noopNotImpl('updateAttendance'),

    // Notifications
    setSessionReminder: base.setSessionReminder || noopNotImpl('setSessionReminder'),
    setBatchReminders: base.setBatchReminders || noopNotImpl('setBatchReminders'),

    // Analytics
    getScheduleAnalytics: base.getScheduleAnalytics || noopNotImpl('getScheduleAnalytics'),
    getAttendanceAnalytics: base.getAttendanceAnalytics || noopNotImpl('getAttendanceAnalytics'),

    // Calendar Integration
    syncWithCalendar: base.syncWithCalendar || noopNotImpl('syncWithCalendar'),
    exportToCalendar: base.exportToCalendar || noopNotImpl('exportToCalendar')
};

module.exports = compat;