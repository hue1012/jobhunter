import { Card, Col, Row, Statistic } from "antd";
import CountUp from 'react-countup';

const DashboardPage = () => {
    const formatter = (value: number | string) => {
        return (
            <CountUp end={Number(value)} separator="," />
        );
    };

    return (
        <Row gutter={[20, 20]}>
            <Col span={24} md={8}>
                <Card title="Thống kê người dùng" bordered={false} >
                    <Statistic
                        title="Người dùng hoạt động"
                        value={112893}
                        formatter={formatter}
                    />

                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Thống kê công ty" bordered={false} >
                    <Statistic
                        title="Công ty đã đăng ký"
                        value={3456}
                        formatter={formatter}
                    />
                </Card>
            </Col>
            <Col span={24} md={8}>
                <Card title="Thống kê việc làm" bordered={false} >
                    <Statistic
                        title="Việc làm đang tuyển"
                        value={8976}
                        formatter={formatter}
                    />
                </Card>
            </Col>

        </Row>
    )
}

export default DashboardPage;