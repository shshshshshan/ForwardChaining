from flask import Flask, request, jsonify
from flask_cors import CORS
import forwardChaining

app = Flask(__name__);
CORS(app)

@app.route('/generate', methods=['POST'])
def generate():
  data = request.get_json();

  required_payload = [
    'facts',
    'rules'
  ]

  for payload in required_payload:
     if payload not in data:
      return jsonify({ 'error' : 'Missing required payloads' }), 400

  new_facts = forwardChaining._generate_facts(data['facts'], data['rules'])
  return jsonify({ 'new_facts': new_facts }), 200

if __name__ == '__main__':
   app.run(debug=True)