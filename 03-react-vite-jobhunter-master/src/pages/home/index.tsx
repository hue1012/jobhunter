import React, { useState, useRef, useEffect } from 'react';
import { Divider, Carousel, Card, Typography } from 'antd';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const { Title } = Typography;

interface Message {
    id: number;
    text: string;
    isBot: boolean;
}

const HomePage = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn?", isBot: true }
    ]);
    const [inputMessage, setInputMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Function để format message với HTML
    const formatMessage = (text: string): string => {
        return text
            // Chuyển **text** thành <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Chuyển *text* thành <em>text</em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Chuyển xuống dòng \n thành <br>
            .replace(/\n/g, '<br>')
            // Chuyển bullet points
            .replace(/• /g, '&bull; ');
    };

    // Scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Xử lý gửi tin nhắn
    const handleSendMessage = async (): Promise<void> => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            isBot: false
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            // Lấy 3 lượt hội thoại gần nhất (loại bỏ tin nhắn chào đầu tiên)
            const recentMessages = messages
                .filter(msg => msg.id !== 1) // Loại bỏ tin nhắn chào ban đầu
                .slice(-6) // Lấy 6 tin nhắn cuối (tương đương 3 lượt hội thoại)
                .map(msg => ({
                    text: msg.text,
                    isBot: msg.isBot
                }));

            // Gọi API Python với lịch sử và câu hỏi hiện tại
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    history: recentMessages
                })
            });

            if (response.ok) {
                const data = await response.json();
                const botMessage = {
                    id: Date.now() + 1,
                    text: data.response || "Xin lỗi, tôi không thể trả lời câu hỏi này.",
                    isBot: true
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('API call failed');
            }
        } catch (error) {
            console.error('Error calling chatbot API:', error);
            // Fake response cho demo
            setTimeout(() => {
                const botMessage = {
                    id: Date.now() + 1,
                    text: `**Xin lỗi!** 😔\n\nTôi đang gặp sự cố kết nối đến server. \n\n**Hãy thử lại sau ít phút nhé!**\n\n*Hoặc liên hệ admin nếu vấn đề vẫn tiếp diễn.*`,
                    isBot: true
                };
                setMessages(prev => [...prev, botMessage]);
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý Enter để gửi tin nhắn
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Hero Section với Carousel */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '80vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Carousel với Gradient và Icon */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.3
                }}>
                    <Carousel
                        autoplay
                        autoplaySpeed={5000}
                        speed={1500}
                        fade
                        effect="fade"
                        dots={true}
                        arrows={false}
                        dotPosition="bottom"
                    >
                        <div>
                            <div style={{
                                width: '100%',
                                height: '80vh',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8rem',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                💼
                            </div>
                        </div>
                        <div>
                            <div style={{
                                width: '100%',
                                height: '80vh',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8rem',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                🚀
                            </div>
                        </div>
                        <div>
                            <div style={{
                                width: '100%',
                                height: '80vh',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8rem',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                🎯
                            </div>
                        </div>
                        <div>
                            <div style={{
                                width: '100%',
                                height: '80vh',
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8rem',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                🏢
                            </div>
                        </div>
                    </Carousel>
                </div>

                {/* Overlay gradient */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.5) 100%)'
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '60px 0',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div className={styles["container"]}>
                        {/* Hero Title */}
                        <div style={{ marginBottom: '50px' }}>
                            <Title
                                level={1}
                                style={{
                                    color: 'white',
                                    fontSize: '3.5rem',
                                    fontWeight: '800',
                                    marginBottom: '20px',
                                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                    letterSpacing: '-1px'
                                }}
                            >
                                🚀 Tìm Việc Làm Mơ Ước
                            </Title>
                            <p style={{
                                fontSize: '1.4rem',
                                opacity: 0.95,
                                fontWeight: '500',
                                maxWidth: '700px',
                                margin: '0 auto',
                                lineHeight: '1.6',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                💼 Kết nối với hàng nghìn cơ hội việc làm hàng đầu từ các công ty uy tín.
                                Khám phá sự nghiệp trong các lĩnh vực ngay hôm nay!
                            </p>
                        </div>

                        {/* Enhanced Search Section */}
                        <Card
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '24px',
                                border: 'none',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                maxWidth: '900px',
                                margin: '0 auto'
                            }}
                            bodyStyle={{
                                padding: '40px'
                            }}
                        >
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <Title
                                    level={3}
                                    style={{
                                        color: '#1f2937',
                                        marginBottom: '8px',
                                        fontSize: '1.8rem',
                                        fontWeight: '700'
                                    }}
                                >
                                    🔍 Tìm Kiếm Thông Minh
                                </Title>
                                <p style={{
                                    color: '#6b7280',
                                    fontSize: '16px',
                                    margin: 0,
                                    fontWeight: '500'
                                }}>
                                    Nhập kỹ năng và địa điểm để tìm công việc phù hợp nhất
                                </p>
                            </div>
                            <SearchClient />
                        </Card>

                        {/* Stats Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '30px',
                            marginTop: '60px',
                            maxWidth: '800px',
                            margin: '60px auto 0'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>1000+</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    opacity: 0.9,
                                    fontWeight: '600'
                                }}>🎯 Việc làm</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>500+</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    opacity: 0.9,
                                    fontWeight: '600'
                                }}>🏢 Công ty uy tín</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>10k+</div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    opacity: 0.9,
                                    fontWeight: '600'
                                }}>👥 Ứng viên</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <div style={{ padding: '80px 0 60px' }}>
                    <CompanyCard />
                </div>

                <Divider style={{
                    borderColor: '#e5e7eb',
                    borderWidth: '2px',
                    margin: '60px 0'
                }} />

                <div style={{ padding: '60px 0 80px' }}>
                    <JobCard />
                </div>
            </div>

            {/* Chatbot Widget */}
            <div
                style={{
                    position: 'fixed',
                    right: '20px',
                    bottom: '20px',
                    zIndex: 1000
                }}
            >
                {isChatOpen ? (
                    // Chat Window
                    <div
                        className="chat-content"
                        style={{
                            width: '350px',
                            height: '500px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10b981',
                                    borderRadius: '50%'
                                }}></div>
                                <span style={{ fontWeight: '600' }}>AI Assistant - Tìm việc</span>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            backgroundColor: '#f8fafc'
                        }}>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    style={{
                                        marginBottom: '12px',
                                        display: 'flex',
                                        justifyContent: message.isBot ? 'flex-start' : 'flex-end'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: message.isBot ? 'white' : '#4f46e5',
                                        color: message.isBot ? '#374151' : 'white',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        fontSize: '14px',
                                        lineHeight: '1.4'
                                    }}>
                                        {message.isBot ? (
                                            // Render HTML cho bot message với formatting
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: formatMessage(message.text)
                                                }}
                                            />
                                        ) : (
                                            // Text thường cho user message
                                            message.text
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: 'white',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            gap: '4px',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                backgroundColor: '#9ca3af',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out'
                                            }}></div>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                backgroundColor: '#9ca3af',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                                            }}></div>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                backgroundColor: '#9ca3af',
                                                borderRadius: '50%',
                                                animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: 'white'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-end'
                            }}>
                                <textarea
                                    value={inputMessage}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Hỏi về tìm việc, CV, phỏng vấn..."
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        resize: 'none',
                                        minHeight: '36px',
                                        maxHeight: '80px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isLoading}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: inputMessage.trim() && !isLoading ? '#4f46e5' : '#9ca3af',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        height: '36px'
                                    }}
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Chat Button
                    <button
                        onClick={() => setIsChatOpen(true)}
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: '#4f46e5',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            color: 'white',
                            fontSize: '24px'
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>): void => {
                            const target = e.currentTarget;
                            target.style.transform = 'scale(1.1)';
                            target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.6)';
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>): void => {
                            const target = e.currentTarget;
                            target.style.transform = 'scale(1)';
                            target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.4)';
                        }}
                    >
                        💼
                    </button>
                )}
            </div>

            <style>
                {`
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0.8);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                /* Custom Carousel Dots Styling */
                .ant-carousel .ant-carousel-dots {
                    bottom: 30px !important;
                    z-index: 10;
                }
                
                .ant-carousel .ant-carousel-dots li button {
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 50% !important;
                    background: rgba(255, 255, 255, 0.4) !important;
                    border: 2px solid rgba(255, 255, 255, 0.6) !important;
                    transition: all 0.3s ease !important;
                }
                
                .ant-carousel .ant-carousel-dots li.ant-carousel-dots-active button {
                    background: rgba(255, 255, 255, 0.9) !important;
                    border-color: rgba(255, 255, 255, 1) !important;
                    transform: scale(1.2) !important;
                }
                
                .ant-carousel .ant-carousel-dots li:hover button {
                    background: rgba(255, 255, 255, 0.7) !important;
                    transform: scale(1.1) !important;
                }
                `}
            </style>
        </>
    );
};

export default HomePage;