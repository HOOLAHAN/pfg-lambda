# Serverless Email Backend with AWS Lambda and SendGrid

This repository contains a serverless backend deployed to AWS Lambda, designed to handle email sending through SendGrid.

## Overview

This backend function receives HTTP requests containing contact form data (name, email, message) and sends an email to a specified recipient using SendGrid. The function includes CORS handling to allow requests from specified origins.

## Prerequisites

- AWS Account
- SendGrid Account and API Key
- Node.js

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - `SENDGRID_API_KEY`: Your SendGrid API key.
   - `EMAIL_TO`: The email address to which the messages will be sent.

   These variables can be set in the AWS Lambda console or through your deployment pipeline.

## Function Explanation

- **Email Sending:** Uses the SendGrid API to send emails based on data received in the request.
- **Error Handling:** Provides meaningful error messages and logs errors for debugging.

## Deployment

Deploy the Lambda function using the AWS Lambda console, AWS CLI, or a deployment framework such as the Serverless Framework.
