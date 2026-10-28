const supabase = require('../config/supabase');
const { mockComplaints, mockNotifications, mockUsers } = require('../config/mockStore');

exports.createComplaint = async (req, res) => {
    try {
        const { type, subject, description, course, school } = req.body;

        const complaintCategory = type || 'Other';
        const complaintSubject = subject || `${complaintCategory} issue`;
        const complaintDescription = description || '';

        const complaintData = {
            id: 'CMP' + Math.floor(Math.random() * 90000 + 10000),
            studentId: req.user.id,
            type: complaintCategory,
            subject: complaintSubject,
            description: complaintDescription,
            status: 'New',
            referral: '',
            remarks: '',
            course: course || '',
            school: school || '',
            created_at: new Date().toISOString(),
            attachment_url: null
        };

        // 1. Supabase configured
        if (supabase) {
            // Update user profile with course and school if provided
            if (course || school) {
                const userUpdate = {};
                if (course) userUpdate.course = course;
                if (school) userUpdate.dept = school;
                await supabase.from('users').update(userUpdate).eq('id', req.user.id);
            }

            // Handle file upload to Supabase Storage if an attachment was sent
            if (req.file) {
                try {
                    const fileExt = req.file.originalname.split('.').pop();
                    const fileName = `${complaintData.id}-${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('complaint-attachments')
                        .upload(fileName, req.file.buffer, {
                            contentType: req.file.mimetype,
                            upsert: false
                        });

                    if (uploadError) {
                        console.warn('Supabase storage upload notice:', uploadError.message);
                    } else {
                        const { data: publicUrlData } = supabase.storage
                            .from('complaint-attachments')
                            .getPublicUrl(fileName);
                        complaintData.attachment_url = publicUrlData ? publicUrlData.publicUrl : null;
                    }
                } catch (storageErr) {
                    console.warn('Storage processing warning:', storageErr.message);
                }
            }

            // Insert complaint into Supabase table
            const { data: complaint, error: insertError } = await supabase
                .from('complaints')
                .insert([complaintData])
                .select()
                .single();

            if (insertError) {
                console.error('Supabase Insert Complaint Error:', insertError);
                throw insertError;
            }

            // Create notification for admin
            try {
                await supabase.from('notifications').insert([{
                    role: 'admin',
                    title: 'New Complaint Submitted',
                    message: `Student ${req.user.id} submitted complaint ${complaint.id} (${complaintCategory}).`,
                    icon: 'fa-inbox'
                }]);
            } catch (e) {
                console.warn('Admin notif error:', e.message);
            }

            // Create notification for student
            try {
                await supabase.from('notifications').insert([{
                    userId: req.user.id,
                    title: 'Complaint Logged Successfully',
                    message: `Your complaint ${complaint.id} has been registered.`,
                    icon: 'fa-paper-plane'
                }]);
            } catch (e) {
                console.warn('Student notif error:', e.message);
            }

            return res.status(201).json({ success: true, data: complaint });
        }

        // 2. Local mock fallback
        // Update mock user profile
        const studentUser = mockUsers.find(u => u.id === req.user.id);
        if (studentUser) {
            if (course) studentUser.course = course;
            if (school) studentUser.dept = school;
        }

        if (req.file) {
            // Create data URI so uploaded file can be previewed/downloaded in mock mode
            complaintData.attachment_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        mockComplaints.unshift(complaintData);

        // Add mock notifications
        mockNotifications.unshift({
            id: 'notif-' + Date.now(),
            userId: null,
            role: 'admin',
            title: 'New Complaint Submitted',
            message: `Student ${req.user.id} submitted complaint ${complaintData.id} (${complaintCategory}).`,
            icon: 'fa-inbox',
            read: false,
            created_at: new Date().toISOString()
        });

        mockNotifications.unshift({
            id: 'notif-' + (Date.now() + 1),
            userId: req.user.id,
            role: null,
            title: 'Complaint Logged Successfully',
            message: `Your complaint ${complaintData.id} has been registered.`,
            icon: 'fa-paper-plane',
            read: false,
            created_at: new Date().toISOString()
        });

        return res.status(201).json({ success: true, data: complaintData });

    } catch (error) {
        console.error('Create Complaint Catch Error:', error);
        res.status(400).json({ success: false, message: 'Failed to create complaint', error: error.message || error });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        const userDept = req.user.dept;

        // 1. Supabase configured
        if (supabase) {
            let query = supabase.from('complaints').select(`
                *,
                users:studentId (
                    name,
                    course,
                    dept
                )
            `).order('created_at', { ascending: false });

            // Role-based filtering
            if (userRole === 'student') {
                query = query.eq('studentId', userId);
            } else if ((userRole === 'staff' || userRole === 'faculty') && userDept) {
                // Department admin: only complaints matching department or referred to department
                query = query.or(`type.ilike.%${userDept}%,referral.ilike.%${userDept}%`);
            }

            const { data: rawComplaints, error } = await query;
            if (error) throw error;

            const complaints = (rawComplaints || []).map(c => ({
                ...c,
                studentName: c.users?.name || c.studentId,
                course: c.course || c.users?.course || '',
                school: c.school || c.users?.dept || ''
            }));

            return res.json({ success: true, data: complaints });
        }

        // 2. Local mock fallback
        let userComplaints = [...mockComplaints];

        if (userRole === 'student') {
            userComplaints = userComplaints.filter(c => c.studentId === userId);
        } else if ((userRole === 'staff' || userRole === 'faculty') && userDept) {
            userComplaints = userComplaints.filter(c =>
                (c.type && c.type.toLowerCase() === userDept.toLowerCase()) ||
                (c.referral && c.referral.toLowerCase().includes(userDept.toLowerCase()))
            );
        }

        userComplaints = userComplaints.map(c => {
            const studentUser = mockUsers.find(u => u.id === c.studentId);
            return {
                ...c,
                studentName: studentUser ? studentUser.name : c.studentId
            };
        });

        userComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json({ success: true, data: userComplaints });

    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, referral, remarks } = req.body;
        const userRole = req.user.role;
        const userDept = req.user.dept;

        // Validate allowed status
        const validStatuses = ['New', 'In Progress', 'Resolved', 'Reopened'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // 1. Supabase configured
        if (supabase) {
            const { data: complaint, error: fetchError } = await supabase
                .from('complaints')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !complaint) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }

            // Role-based authorization check
            let targetStatus = status;
            if (userRole === 'student') {
                if (complaint.studentId !== req.user.id) {
                    return res.status(403).json({ success: false, message: 'Access denied: You can only update your own complaints.' });
                }
                if (status !== 'Reopened' && status !== 'Reopen Requested') {
                    return res.status(403).json({ success: false, message: 'Students can only request to reopen a resolved complaint.' });
                }
                if (complaint.status !== 'Resolved') {
                    return res.status(400).json({ success: false, message: 'Only resolved complaints can be reopened.' });
                }
                // When student requests reopen, route it for corresponding admin and super admin approval
                targetStatus = 'Reopen Requested';
            } else if ((userRole === 'staff' || userRole === 'faculty') && userDept) {
                const isAssignedDept = (complaint.type && complaint.type.toLowerCase() === userDept.toLowerCase()) ||
                                       (complaint.dept && complaint.dept.toLowerCase() === userDept.toLowerCase()) ||
                                       (complaint.referral && complaint.referral.toLowerCase().includes(userDept.toLowerCase()));
                if (!isAssignedDept) {
                    return res.status(403).json({ success: false, message: 'Access denied: You are only authorized to manage complaints for your department.' });
                }
            }

            const oldStatus = complaint.status;
            const updatePayload = {};
            if (targetStatus) updatePayload.status = targetStatus;
            if (referral !== undefined) updatePayload.referral = referral;
            if (remarks !== undefined) updatePayload.remarks = remarks;

            const { data: updatedComplaint, error: updateError } = await supabase
                .from('complaints')
                .update(updatePayload)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Notify student or admins if status changed
            if (targetStatus && oldStatus !== targetStatus) {
                if (targetStatus === 'Reopen Requested') {
                    const complaintDept = complaint.dept || complaint.type || complaint.school || 'Department';
                    const reasonText = remarks || 'Reason not specified.';
                    try {
                        // 1. Notify Super Admin
                        // 2. Notify Corresponding Department Staff
                        await supabase.from('notifications').insert([
                            {
                                role: 'admin',
                                title: 'Reopen Approval Requested',
                                message: `Student ${req.user.id} requested to reopen complaint ${id} (${complaintDept}). Reason: ${reasonText}`,
                                icon: 'fa-rotate-left'
                            },
                            {
                                role: 'staff',
                                title: `Reopen Request: ${complaintDept}`,
                                message: `Student ${req.user.id} requested to reopen complaint ${id} in ${complaintDept}. Reason: ${reasonText}`,
                                icon: 'fa-rotate-left'
                            }
                        ]);
                    } catch (e) {
                        console.warn('Admin & Dept reopen request notif error:', e.message);
                    }
                } else if (oldStatus === 'Reopen Requested' && targetStatus === 'Reopened') {
                    try {
                        await supabase.from('notifications').insert([{
                            userId: complaint.studentId,
                            title: 'Reopen Request Approved',
                            message: `Your request to reopen complaint ${id} has been approved. The complaint is now Reopened.`,
                            icon: 'fa-check-circle'
                        }]);
                    } catch (e) {
                        console.warn('Student reopen approval notif error:', e.message);
                    }
                } else if (oldStatus === 'Reopen Requested' && targetStatus === 'Resolved') {
                    try {
                        await supabase.from('notifications').insert([{
                            userId: complaint.studentId,
                            title: 'Reopen Request Declined',
                            message: `Your request to reopen complaint ${id} was declined: ${remarks || 'Remains resolved.'}`,
                            icon: 'fa-circle-xmark'
                        }]);
                    } catch (e) {
                        console.warn('Student reopen decline notif error:', e.message);
                    }
                } else {
                    try {
                        await supabase.from('notifications').insert([{
                            userId: complaint.studentId,
                            title: 'Complaint Status Updated',
                            message: `Your complaint ${id} status has been updated to "${targetStatus}".`,
                            icon: 'fa-circle-dot'
                        }]);
                    } catch (e) {
                        console.warn('Student status notif error:', e.message);
                    }
                }
            }

            return res.json({ success: true, data: updatedComplaint });
        }

        // 2. Local mock fallback
        const complaintIndex = mockComplaints.findIndex(c => c.id === id);
        if (complaintIndex === -1) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const complaint = mockComplaints[complaintIndex];

        // Role-based authorization check
        let targetStatus = status;
        if (userRole === 'student') {
            if (complaint.studentId !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Access denied: You can only update your own complaints.' });
            }
            if (status !== 'Reopened' && status !== 'Reopen Requested') {
                return res.status(403).json({ success: false, message: 'Students can only request to reopen a resolved complaint.' });
            }
            if (complaint.status !== 'Resolved') {
                return res.status(400).json({ success: false, message: 'Only resolved complaints can be reopened.' });
            }
            // When student requests reopen, route it for corresponding admin and super admin approval
            targetStatus = 'Reopen Requested';
        } else if ((userRole === 'staff' || userRole === 'faculty') && userDept) {
            const isAssignedDept = (complaint.type && complaint.type.toLowerCase() === userDept.toLowerCase()) ||
                                   (complaint.dept && complaint.dept.toLowerCase() === userDept.toLowerCase()) ||
                                   (complaint.referral && complaint.referral.toLowerCase().includes(userDept.toLowerCase()));
            if (!isAssignedDept) {
                return res.status(403).json({ success: false, message: 'Access denied: You are only authorized to manage complaints for your department.' });
            }
        }

        const oldStatus = complaint.status;
        if (targetStatus) complaint.status = targetStatus;
        if (referral !== undefined) complaint.referral = referral;
        if (remarks !== undefined) complaint.remarks = remarks;

        // Notify student or admins of update
        if (targetStatus && oldStatus !== targetStatus) {
            if (targetStatus === 'Reopen Requested') {
                const complaintDept = complaint.dept || complaint.type || complaint.school || 'Department';
                const reasonText = remarks || 'Reason not specified.';
                // 1. Notify Super Admin
                mockNotifications.unshift({
                    id: 'notif-' + Date.now() + '-1',
                    userId: null,
                    role: 'admin',
                    title: 'Reopen Approval Requested',
                    message: `Student ${req.user.id} requested to reopen complaint ${id} (${complaintDept}). Reason: ${reasonText}`,
                    icon: 'fa-rotate-left',
                    read: false,
                    created_at: new Date().toISOString()
                });
                // 2. Notify Corresponding Department Staff
                mockNotifications.unshift({
                    id: 'notif-' + Date.now() + '-2',
                    userId: null,
                    role: 'staff',
                    title: `Reopen Request: ${complaintDept}`,
                    message: `Student ${req.user.id} requested to reopen complaint ${id} in ${complaintDept}. Reason: ${reasonText}`,
                    icon: 'fa-rotate-left',
                    read: false,
                    created_at: new Date().toISOString()
                });
            } else if (oldStatus === 'Reopen Requested' && targetStatus === 'Reopened') {
                mockNotifications.unshift({
                    id: 'notif-' + Date.now(),
                    userId: complaint.studentId,
                    role: null,
                    title: 'Reopen Request Approved',
                    message: `Your request to reopen complaint ${id} has been approved. The complaint is now Reopened.`,
                    icon: 'fa-check-circle',
                    read: false,
                    created_at: new Date().toISOString()
                });
            } else if (oldStatus === 'Reopen Requested' && targetStatus === 'Resolved') {
                mockNotifications.unshift({
                    id: 'notif-' + Date.now(),
                    userId: complaint.studentId,
                    role: null,
                    title: 'Reopen Request Declined',
                    message: `Your request to reopen complaint ${id} was declined: ${remarks || 'Remains resolved.'}`,
                    icon: 'fa-circle-xmark',
                    read: false,
                    created_at: new Date().toISOString()
                });
            } else {
                mockNotifications.unshift({
                    id: 'notif-' + Date.now(),
                    userId: complaint.studentId,
                    role: null,
                    title: 'Complaint Status Updated',
                    message: `Your complaint ${id} status has been updated to "${targetStatus}".`,
                    icon: 'fa-circle-dot',
                    read: false,
                    created_at: new Date().toISOString()
                });
            }
        }

        return res.json({ success: true, data: complaint });

    } catch (error) {
        console.error('Update Complaint Error:', error);

        if (error.code === '23514' || (error.message && error.message.includes('check constraint'))) {
            return res.status(400).json({
                success: false,
                message: 'Database constraint violation: Cannot save "Reopened" status. Please run backend/fix_complaints_status.sql in Supabase.',
                error: error.message
            });
        }

        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
