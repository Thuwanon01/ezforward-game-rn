import { useAuth } from '@/contexts/AuthContext';
import useRepositories from '@/hooks/useRepositories';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type ButtonProps = {
    children: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    className?: string;
};

const Button = ({ children, onPress, disabled, className }: ButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`
      px-3 py-2 mx-1 my-1 rounded-md
      ${disabled ? 'bg-gray-300 opacity-60' : 'bg-blue-500 active:bg-blue-600 opacity-100'}
      ${className ?? ''}
    `}
    >
        <Text className="text-white text-center font-medium">
            {children}
        </Text>
    </TouchableOpacity>
);

export default function GetAnswerHistory() {
    const auth = useAuth();
    const repos = useRepositories(auth.accessToken).current;

    const [page, setPage] = useState(1);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ล็อกจำนวนหน้าจากการคำนวณ "ครั้งแรก" เท่านั้น
    const [initialTotalPages, setInitialTotalPages] = useState<number | null>(null);

    // ดึงข้อมูลแต่ละหน้า
    const fetchData = async (pageNum: number) => {
        setIsLoading(true);
        console.log(`กำลังดึงข้อมูลหน้า: ${pageNum}`);

        try {
            const summary = await repos.gamev2.fetchAnswerHistory({
                start_date: '2025-10-01',
                end_date: '2025-10-31',
                page: String(pageNum),
            });

            console.log(summary);
            setData(summary);

            // คำนวณ totalPages จาก response ครั้งแรกเท่านั้น
            setInitialTotalPages(prev => {
                // ถ้ามีค่าแล้ว ไม่ต้องคำนวณใหม่ (ล็อกไว้เลย)
                if (prev !== null) return prev;

                const totalCount: number = summary?.count ?? 0;
                const pageSize: number =
                    Array.isArray(summary?.results) && summary.results.length > 0
                        ? summary.results.length
                        : 20; // fallback ป้องกัน divide by zero

                const computed =
                    totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

                console.log('[pagination] initial totalPages =', computed);
                return computed;
            });

        } catch (error) {
            console.error('Failed to fetch data:', error);
            alert('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setIsLoading(false);
        }
    };

    // load หน้าแรกตอน mount
    useEffect(() => {
        fetchData(1);
    }, []);

    // ใช้ค่า totalPages ที่ล็อกจากครั้งแรก ถ้ายังไม่มีให้ถือว่า 1
    const totalPages: number = initialTotalPages ?? 1;

    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;

    const goToPage = (target: number) => {
        // guard กันพลาดทั้งหมด
        if (isLoading) return;
        if (target < 1 || target > totalPages) return;
        if (target === page) return;

        setPage(target);
        fetchData(target);
    };

    const handleFirst = () => goToPage(1);
    const handleLast = () => goToPage(totalPages); // ใช้ totalPages ที่ล็อคแล้ว
    const handleNext = () => {
        if (isLastPage) return;
        goToPage(page + 1);
    };
    const handlePrevious = () => {
        if (isFirstPage) return;
        goToPage(page - 1);
    };

    // สร้างชุดเลขหน้า เช่น 3 4 [5] 6 7
    const getPageNumbers = () => {
        const maxButtons = 5; // อยากโชว์กี่ปุ่มเลข
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxButtons / 2); // 2
        let start = page - half;
        let end = page + half;

        if (start < 1) {
            start = 1;
            end = maxButtons;
        }
        if (end > totalPages) {
            end = totalPages;
            start = totalPages - maxButtons + 1;
        }

        const pages: number[] = [];
        for (let p = start; p <= end; p++) {
            pages.push(p);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <View className="p-5 items-center">
            <Text className="text-lg my-2">
                Current Page: {page}
            </Text>

            {isLoading && <ActivityIndicator size="large" color="#2563eb" />}

            {data && (
                <Text className="text-base my-2">
                    Total Count: {data?.count ?? 0} (Total Pages: {totalPages})
                </Text>
            )}


            {/* Pagination bar */}
            <View className="flex-row items-center justify-center mt-4">

                {/* << First */}
                <Button onPress={handleFirst} disabled={isFirstPage || isLoading}>
                    {'<<'}
                </Button>

                {/* < Previous */}
                <Button onPress={handlePrevious} disabled={isFirstPage || isLoading}>
                    {'<'}
                </Button>

                {/* เลขหน้า */}
                {pageNumbers.map(p => (
                    <TouchableOpacity
                        key={p}
                        disabled={p === page || isLoading}
                        onPress={() => goToPage(p)}
                        className={`
              px-3 py-2 mx-1 my-1 rounded-md border
              ${p === page
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300'
                            }
            `}
                    >
                        <Text
                            className={
                                p === page
                                    ? 'text-white text-center font-semibold'
                                    : 'text-gray-800 text-center'
                            }
                        >
                            {p}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* > Next */}
                <Button onPress={handleNext} disabled={isLastPage || isLoading}>
                    {'>'}
                </Button>

                {/* >> Last */}
                <Button onPress={handleLast} disabled={isLastPage || isLoading}>
                    {'>>'}
                </Button>
            </View>
        </View>
    );
}
