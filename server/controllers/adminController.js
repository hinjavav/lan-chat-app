exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [users] = await global.db.execute(
      `SELECT id, email, full_name, role, is_online, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ?, ?`,
      [offset, limit]
    );

    const [countResult] = await global.db.execute(
      'SELECT COUNT(*) as total FROM users'
    );

    res.json({
      users,
      pagination: {
        total: countResult[0].total,
        page,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const [userStats] = await global.db.execute(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    const [onlineUsers] = await global.db.execute(
      `SELECT COUNT(*) as count FROM users WHERE is_online = true`
    );

    const [messageStats] = await global.db.execute(
      `SELECT COUNT(*) as total_messages FROM messages`
    );

    const stats = {
      users: {},
      online_users: onlineUsers[0].count,
      total_messages: messageStats[0].total_messages
    };

    userStats.forEach(row => {
      stats.users[row.role] = row.count;
    });

    res.json(stats);

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, full_name, role = 'user' } = req.body;

        if (!email || !password || !full_name || !['admin', 'support', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        const [existing] = await global.db.execute(
            'SELECT id FROM users WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await require('bcryptjs').hash(password, 12);

        const [result] = await global.db.execute(
            'INSERT INTO users (email, password, full_name, role, email_verified) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, role, true]
        );

        res.status(201).json({
            message: `User created successfully as ${role}`,
            userId: result.insertId
        });

    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
