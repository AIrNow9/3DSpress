import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download, Share2, Users, Building, Store, ShoppingBag,
  Facebook, Twitter, Linkedin, Instagram, MessageCircle, ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 3DSpress QR Marketing page
export default function QRMarketing() {
  const { toast } = useToast();
  const [qrCodesGenerated, setQrCodesGenerated] = useState(false);

  const qrData = [
    {
      key: 'driver',
      title: 'Driver Recruitment',
      icon: Users,
      description: 'For recruiting new drivers',
      url: `${window.location.origin}/driver-signup`,
      usage: 'Gas stations, auto shops, job boards',
      message: 'Earn $25-40/hour driving for 3DSpress',
      color: 'from-green-500 to-blue-500'
    },
    {
      key: 'company',
      title: 'Company Partnership',
      icon: Building,
      description: 'For business partnerships',
      url: `${window.location.origin}/company-signup`,
      usage: 'LinkedIn, business events, B2B marketing',
      message: 'Employee transportation solutions by 3DSpress',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      key: 'customer',
      title: 'Customer Acquisition',
      icon: Users,
      description: 'For general customers',
      url: `${window.location.origin}/`,
      usage: 'Business cards, social media, marketing',
      message: 'Safe rides & local shopping with 3DSpress',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'stores',
      title: 'Store Locator',
      icon: Store,
      description: 'Find local stores',
      url: `${window.location.origin}/stores`,
      usage: 'Retail partnerships, store marketing',
      message: 'Find stores with live busy times',
      color: 'from-orange-500 to-red-500'
    },
    {
      key: 'shopping',
      title: 'Local Shopping',
      icon: ShoppingBag,
      description: 'Authentic products from your city',
      url: `${window.location.origin}/shopping`,
      usage: 'Product partnerships, retail marketing',
      message: 'Local products with quality assurance',
      color: 'from-pink-500 to-rose-500'
    },
    {
      key: 'homepage',
      title: 'Main Platform',
      icon: Share2,
      description: 'Complete 3DSpress platform',
      url: `${window.location.origin}/`,
      usage: 'General marketing, business cards',
      message: 'The complete 3DSpress experience',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  useEffect(() => {
    setQrCodesGenerated(true);
  }, []);

  const generateQRCodeUrl = (url: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const downloadQR = async (key: string, title: string) => {
    const item = qrData.find(d => d.key === key);
    if (item) {
      const qrUrl = generateQRCodeUrl(item.url);
      try {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `3DSpress-${title.replace(/\s+/g, '-')}-QR.png`;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: 'QR Code Downloaded',
          description: `${title} QR code saved to your downloads`
        });
      } catch (error) {
        toast({
          title: 'Download Error',
          description: 'Unable to download QR code. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const downloadAllQRs = () => {
    qrData.forEach((item, index) => {
      setTimeout(() => {
        downloadQR(item.key, item.title);
      }, index * 300);
    });
    toast({
      title: 'Downloading All QR Codes',
      description: `All ${qrData.length} QR codes are being downloaded`
    });
  };

  const copyURL = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: `${title} URL copied to clipboard`
    });
  };

  const shareToSocial = (platform: string, url: string, title: string, description: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(`${title} - 3DSpress`);
    const encodedDescription = encodeURIComponent(description);
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}&hashtags=3DSpress,RideSharing,LocalShopping`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'instagram': {
        const instagramMessage = `${title} - 3DSpress\n\n${description}\n\n${url}\n\n#3DSpress #RideSharing #LocalShopping`;
        navigator.clipboard.writeText(instagramMessage).then(() => {
          toast({
            title: 'Copied for Instagram',
            description: 'Link and message copied to clipboard. Paste in your Instagram story or bio!'
          });
        });
        return;
      }
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast({
      title: 'Share Opened',
      description: `${title} shared to ${platform}`
    });
  };

  const downloadQRWithBranding = async (key: string, title: string) => {
    const item = qrData.find(d => d.key === key);
    if (item) {
      const qrUrl = generateQRCodeUrl(item.url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 400;
          canvas.height = 500;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`3DSpress - ${title}`, 200, 40);
          const qrImage = new Image();
          qrImage.crossOrigin = 'anonymous';
          qrImage.onload = () => {
            ctx.drawImage(qrImage, 100, 70, 200, 200);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Scan with your phone camera', 200, 300);
            ctx.fillText(`to access 3DSpress`, 200, 325);
            ctx.font = '12px Arial';
            ctx.fillText(item.url, 200, 360);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#374151';
            const words = item.description.split(' ');
            let line = '';
            let y = 390;
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;
              if (testWidth > 300 && n > 0) {
                ctx.fillText(line, 200, y);
                line = words[n] + ' ';
                y += 20;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 200, y);
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#3b82f6';
            ctx.fillText('3DSpress.com', 200, 460);
            const link = document.createElement('a');
            link.download = `3DSpress-${title.replace(/\s+/g, '-')}-Branded-QR.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast({
              title: 'Branded QR Downloaded',
              description: `${title} QR with branding saved`
            });
          };
          qrImage.src = qrUrl;
        }
      } catch (error) {
        toast({
          title: 'Download Error',
          description: 'Unable to create branded QR code. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to 3DSpress Home
            </Button>
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <em><strong>3DSpress</strong></em> Marketing QR Codes
          </h1>
          <p className="text-xl text-cyan-200 mb-6">
            Download and share QR codes for different marketing campaigns
          </p>
          <div className="flex justify-center space-x-6 text-4xl mb-6">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>📱</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>📥</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🚗</span>
            <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🏢</span>
          </div>
          <div className="flex gap-4 justify-center mb-8">
            <Button
              onClick={downloadAllQRs}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold"
            >
              <Download className="mr-2 h-5 w-5" />
              Download All QR Codes
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
            >
              🔄 Refresh Page
            </Button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {qrData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.key} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{item.title}</CardTitle>
                  <p className="text-cyan-200">{item.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-white rounded-lg p-4 mb-4 inline-block relative">
                    <img
                      src={generateQRCodeUrl(item.url)}
                      alt={`QR Code for ${item.title}`}
                      width="200"
                      height="200"
                      className="border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-1 rounded">
                      {item.key}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 mb-4 text-left">
                    <p className="text-white/90 text-sm mb-2">
                      <strong>Usage:</strong> {item.usage}
                    </p>
                    <p className="text-white/90 text-sm">
                      <strong>Message:</strong> "{item.message}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => downloadQR(item.key, item.title)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        onClick={() => downloadQRWithBranding(item.key, item.title)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Branded
                      </Button>
                    </div>
                    <Button
                      onClick={() => copyURL(item.url, item.title)}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10 text-sm"
                    >
                      <Share2 className="mr-2 h-3 w-3" />
                      Copy URL
                    </Button>
                    <div className="bg-white/5 rounded-lg p-3 mt-2">
                      <p className="text-white/80 text-xs mb-2 text-center">Share on Social Media:</p>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('facebook', item.url, item.title, item.message)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-8"
                        >
                          <Facebook className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('twitter', item.url, item.title, item.message)}
                          className="bg-sky-500 hover:bg-sky-600 text-white p-2 h-8"
                        >
                          <Twitter className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('instagram', item.url, item.title, item.message)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 h-8"
                        >
                          <Instagram className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('linkedin', item.url, item.title, item.message)}
                          className="bg-blue-700 hover:bg-blue-800 text-white p-2 h-8"
                        >
                          <Linkedin className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('whatsapp', item.url, item.title, item.message)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 h-8"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => shareToSocial('telegram', item.url, item.title, item.message)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 h-8"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}