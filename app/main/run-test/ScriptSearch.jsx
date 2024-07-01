import useSession from "@/hooks/useSession";
import useUfuzzy from "@billyen2012/use-ufuzzy";
import { SearchIcon } from "@chakra-ui/icons";
import { Avatar, Box, HStack, Spinner, Tag, Text } from "@chakra-ui/react";
import axios from "axios";
import { Select } from "chakra-react-select";
import { useMemo, useState } from "react";

/**
 *
 * @param {{
 * chakraStyles: import("chakra-react-select").ChakraStylesConfig;
 * onChange(doc:{label:any;value:string});
 * currentScriptId:string;
 * }} param0
 * @returns
 */
export default function ScriptSearch({
  chakraStyles = {},
  onChange = () => {},
  currentScriptId = "",
  ...restProps
}) {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const {
    result,
    search,
    items,
    setSearch,
    // after hook is mounted, you must use setItems() to update the search items
    setItems,
  } = useUfuzzy([], {
    defaultSearch: "",
    RenderHighlight: ({ text }) => (
      <mark style={{ backgroundColor: "transparent", color: "orange" }}>
        {text}
      </mark>
    ),
    ItemTextGetter: ({ name }) => {
      return name;
    },
  });

  const handleOnFocus = async () => {
    if (!isLoading) {
      setIsLoading(true);
      const res = await axios.get("/api/scripts?include=user");
      setIsLoading(false);
      setItems(res.data);
    }
  };

  const options = useMemo(() => {
    if (!search) {
      return items.map((e) => ({
        value: e.id,
        label: e.name,
        disabled: e.id === currentScriptId,
        original: e,
      }));
    }
    return result.map((e) => ({
      value: e.item.id,
      label: e.highlight,
      disabled: e.item.id === currentScriptId,
      original: e.item,
    }));
  }, [result, search, items]);

  return (
    <Box position={"relative"} w={"100%"}>
      <Select
        {...restProps}
        loadingMessage={() => {
          return <Spinner />;
        }}
        chakraStyles={{
          ...chakraStyles,
          valueContainer: (props) => {
            return {
              ...props,
              ...(chakraStyles.valueContainer
                ? chakraStyles.valueContainer(props)
                : undefined),
              pl: "36px",
              h: "42px",
            };
          },
        }}
        isLoading={isLoading}
        filterOption={() => true} // every return true because filter will be done by the uFuzzy
        onInputChange={(searchValue) => {
          setSearch(searchValue);
        }}
        getOptionLabel={
          /**
           * @param {{
           * value: string;
           * label: string;
           * disabled: boolean;
           * original:{
           *    id:string;
           *    name:string;
           *    isPublic:boolean;
           *    createdAt:string;
           *    updatedAt:string;
           *    user:{
           *      id:string;
           *      emailHash:string;
           *      name:string;
           *    }
           *  }
           * }} item
           */
          (item) => {
            return (
              <HStack>
                <Avatar
                  size="sm"
                  title={item.original.user.name}
                  src={
                    "https://2.gravatar.com/avatar/" +
                    item.original.user.emailHash +
                    "?d=identicon"
                  }
                />
                <Text>{item.label}</Text>
                {item.original.user.id === session.user.id && (
                  <Tag colorScheme={"purple"}>OWNER</Tag>
                )}
              </HStack>
            );
          }
        }
        onChange={onChange}
        options={options}
        onFocus={handleOnFocus}
        components={{
          DropdownIndicator: () => null,
        }}
        placeholder="Search and select a script"
        isOptionDisabled={(option) => option.disabled}
      />
      <SearchIcon
        pos={"absolute"}
        top={"12px"}
        left={"12px"}
        boxSize={"20px"}
      />
    </Box>
  );
}
