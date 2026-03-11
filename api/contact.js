const Busboy = require('busboy');
const FormData = require('form-data');
const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('X-Powered-By', 'viajes-app-contact');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const accessKey = process.env.EMAIL_KEY_HERE;
  if (!accessKey) {
    return res.status(500).json({ success: false, message: 'Servicio de email no configurado. Falta EMAIL_KEY_HERE.' });
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
    return res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      detail: error.message
    });
  }
};

function submitForm(form) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname: 'api.web3forms.com',
      path: '/submit',
      headers: form.getHeaders()
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        console.log('Web3Forms response status:', response.statusCode);
        console.log('Web3Forms response body:', data.substring(0, 500));
        try {
          resolve({ status: response.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Web3Forms returned status ${response.statusCode}: ${data.substring(0, 300)}`));
        }
      });
      response.on('error', reject);
    });

    request.on('error', reject);
    form.pipe(request);
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
