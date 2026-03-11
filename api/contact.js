module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const accessKey = process.env.EMAIL_KEY_HERE;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: 'Servicio de email no configurado.' });
  }

  return res.status(200).json({ success: true, key: accessKey });
};
