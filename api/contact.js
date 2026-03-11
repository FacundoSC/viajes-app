const Busboy = require('busboy');
const FormData = require('form-data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const accessKey = process.env.EMAIL_KEY_HERE;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: 'Servicio de email no configurado' });
  }

  try {
    const { fields, files } = await parseMultipart(req);

    const form = new FormData();
    form.append('access_key', accessKey);

    for (const [key, value] of Object.entries(fields)) {
      if (key !== 'access_key') {
        form.append(key, value);
      }
    }

    for (const file of files) {
      form.append('attachment', file.buffer, {
        filename: file.filename,
        contentType: file.mimeType
      });
    }

    const { status, body } = await submitForm(form);
    return res.status(status).json(body);
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ success: false, message: 'Error al enviar el mensaje' });
  }
};

function submitForm(form) {
  return new Promise((resolve, reject) => {
    form.submit('https://api.web3forms.com/submit', (err, response) => {
      if (err) return reject(err);
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error('Invalid JSON response from Web3Forms: ' + data.substring(0, 200)));
        }
      });
      response.on('error', reject);
    });
  });
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          fieldname: name,
          filename: info.filename,
          mimeType: info.mimeType,
          buffer: Buffer.concat(chunks)
        });
      });
    });

    busboy.on('finish', () => resolve({ fields, files }));
    busboy.on('error', reject);

    req.pipe(busboy);
  });
}
