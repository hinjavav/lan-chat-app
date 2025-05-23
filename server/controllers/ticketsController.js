exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.userId;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const [result] = await global.db.execute(
      `INSERT INTO tickets (user_id, subject, message)
       VALUES (?, ?, ?)`,
      [userId, subject, message]
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: result.insertId
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let query = `
      SELECT t.id, t.subject, t.message, t.status, t.created_at,
             u.full_name AS user_name,
             s.full_name AS support_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users s ON t.support_id = s.id
    `;
    const params = [];

    if (role === 'user') {
      query += ' WHERE t.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tickets] = await global.db.execute(query, params);

    res.json({ tickets });

  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;
    const supportId = req.user.userId;

    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await global.db.execute(
      `UPDATE tickets
       SET status = ?, support_id = ?
       WHERE id = ?`,
      [status, supportId, ticketId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket updated successfully' });

  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
