
const Footer = () => {
    return (
        <footer style={{ 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            padding: '40px 0 20px',
            textAlign: 'center',
            marginTop: 'auto',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            marginBottom: '15px',
                            color: 'white'
                        }}>JobHunter</h3>
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: 'rgba(255, 255, 255, 0.8)',
                            margin: 0
                        }}>
                            Nền tảng tìm kiếm việc làm hàng đầu, kết nối ứng viên với các cơ hội nghề nghiệp tốt nhất.
                        </p>
                    </div>
                    
                    <div>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: 'white'
                        }}>Liên kết</h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <a href="/job" style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'color 0.3s ease'
                            }}>Việc làm</a>
                            <a href="/company" style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'color 0.3s ease'
                            }}>Công ty</a>
                        </div>
                    </div>

                    <div>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: 'white'
                        }}>Liên hệ</h4>
                        <div style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.6'
                        }}>
                            <p style={{ margin: '0 0 4px 0' }}>📧 contact@jobhunter.vn</p>
                            <p style={{ margin: '0 0 4px 0' }}>📞 (+84) 123 456 789</p>
                            <p style={{ margin: 0 }}>📍 Hà Nội, Việt Nam</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingTop: '20px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                }}>
                    <p style={{ margin: 0 }}>
                        © 2024 JobHunter. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;