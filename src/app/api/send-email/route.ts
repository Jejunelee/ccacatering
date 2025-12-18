import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;
const yourEmail = process.env.YOUR_EMAIL;

// Log environment check (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Resend API Key exists:', !!resendApiKey);
  console.log('Your email exists:', !!yourEmail);
}

if (!resendApiKey) {
  console.error('RESEND_API_KEY is missing from environment variables');
}

if (!yourEmail) {
  console.error('YOUR_EMAIL is missing from environment variables');
}

const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, phone, description } = body;

    // Log the received data (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Received form data:', { name, email, phone, description });
    }

    // Basic validation
    if (!name || !email || !phone || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Cravings Website <onboarding@resend.dev>', // Use Resend's default domain
      to: [yourEmail!], // Your email address
      replyTo: email, // So you can reply directly to the user
      subject: `New Lead: ${name} wants to connect!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Lead from Cravings</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF914D 0%, #FF8A3D 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎂 New Lead Alert!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Someone wants to get in touch with Cravings</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FF8A3D; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p><strong style="color: #FF8A3D;">👤 Name:</strong> ${name}</p>
              <p><strong style="color: #FF8A3D;">📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong style="color: #FF8A3D;">📱 Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
              <p><strong style="color: #FF8A3D;">📝 Description:</strong></p>
              <div style="margin-top: 8px; background: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-line;">
                ${description.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: #FF8A3D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">✉️ Reply to ${name}</a>
              <a href="tel:${phone}" style="display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px; margin-left: 10px;">📱 Call Now</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This email was sent from your Cravings website contact form.</p>
            <p>Time received: ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `,
      text: `
NEW LEAD FROM CRAVINGS WEBSITE

Name: ${name}
Email: ${email}
Phone: ${phone}

Description:
${description}

---
This lead was submitted at ${new Date().toLocaleString()}
      `,
    });

    // Handle Resend errors
    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Email sent successfully!',
        data: data
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Server error:', error);
    
    // Return a proper JSON response even for unexpected errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}