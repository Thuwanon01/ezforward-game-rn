import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
        <Text className="text-white text-center font-medium">{children}</Text>
    </TouchableOpacity>
);

type PaginationProps = {
    page: number;
    totalPages: number;
    loading: boolean;
    onChangePage: (page: number) => void;
};

const getPageNumbers = (page: number, totalPages: number, maxButtons = 5) => {
    if (totalPages <= maxButtons) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxButtons / 2);
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
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
};

const AnswerHistoryPagination: React.FC<PaginationProps> = ({
    page,
    totalPages,
    loading,
    onChangePage,
}) => {
    if (totalPages <= 1) return null;

    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;
    const pageNumbers = getPageNumbers(page, totalPages);

    const goToPage = (target: number) => {
        if (loading) return;
        if (target < 1 || target > totalPages) return;
        if (target === page) return;
        onChangePage(target);
    };

    return (
        <View className="items-center justify-center border-t border-gray-200 bg-white py-3">
            <Text className="mb-1 text-sm text-gray-700">
                Page {page} / {totalPages}
            </Text>
            <View className="mt-1 flex-row items-center justify-center">
                {/* << First */}
                <Button onPress={() => goToPage(1)} disabled={isFirstPage || loading}>
                    {'<<'}
                </Button>

                {/* < Previous */}
                <Button
                    onPress={() => goToPage(page - 1)}
                    disabled={isFirstPage || loading}
                >
                    {'<'}
                </Button>

                {/* Page numbers */}
                {pageNumbers.map((p) => (
                    <TouchableOpacity
                        key={p}
                        disabled={p === page || loading}
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
                <Button
                    onPress={() => goToPage(page + 1)}
                    disabled={isLastPage || loading}
                >
                    {'>'}
                </Button>

                {/* >> Last */}
                <Button
                    onPress={() => goToPage(totalPages)}
                    disabled={isLastPage || loading}
                >
                    {'>>'}
                </Button>
            </View>
        </View>
    );
};

export default AnswerHistoryPagination;
