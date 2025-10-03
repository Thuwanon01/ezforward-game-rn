import { Button, ButtonText } from "@/components/ui/button";

interface Props {
    text: string;
    onPress: () => void;
}

export default function TextButton({ text, onPress }: Props) {
    return (
        <Button
            variant="solid"
            size="lg"
            action="primary"
            className="bg-[#FCC61D] rounded-3xl px-[32] data-[hover=true]:bg-blue-200 data-[active=true]:bg-blue-200"
            onPress={onPress}>
            <ButtonText
                className='text-white font-bold text-3xl '>
                {text}</ButtonText>
        </Button>

    );
}
