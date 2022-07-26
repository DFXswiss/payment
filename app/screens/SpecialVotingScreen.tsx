import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import AppLayout from "../components/AppLayout";
import Loading from "../components/util/Loading";
import { RadioButton } from "../elements/RadioButton";
import { SpacerV } from "../elements/Spacers";
import { H1, H3, T5 } from "../elements/Texts";
import withSession from "../hocs/withSession";
import useAuthGuard from "../hooks/useAuthGuard";
import { CfpResult, ResultStatus, VotingType } from "../models/CfpResult";
import { CfpVote, CfpVotes } from "../models/User";
import { getSettings, getUserDetail, putCfpVotes } from "../services/ApiService";
import { Session } from "../services/AuthService";
import NotificationService from "../services/NotificationService";
import AppStyles from "../styles/AppStyles";

const SpecialVotingScreen = ({ session }: { session?: Session }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [cfpResults, setCfpResults] = useState<CfpResult[]>();
  const [canVote, setCanVote] = useState(false);
  const [votes, setVotes] = useState<CfpVotes | undefined>();
  const [isSaving, setIsSaving] = useState<{ number: Number; vote: CfpVote } | undefined>();

  useAuthGuard(session);

  const specialVotingCfp: CfpResult = {
    number: 0,
    title: t("specialVoting.title"),
    type: VotingType.CFP,
    dfiAmount: 0,
    htmlUrl: "",
    currentResult: ResultStatus.APPROVED,
    totalVotes: {
      total: 0,
      possible: 0,
      turnout: 0,
      yes: 0,
      neutral: 0,
      no: 0
    },
    cakeVotes: {
      total: 0,
      yes: 0,
      neutral: 0,
      no: 0
    },
    voteDetails: {
      yes: [],
      no: [],
      neutral: []
    },
    startDate: "2022-07-25T23:59:59.000Z",
    endDate: "2022-08-02T23:59:59.000Z"
  }

  const isSpecialVoting = (result: CfpResult) => result.title === specialVotingCfp.title

  useEffect(() => {
    Promise.all([getSettings(), getUserDetail()])
      .then(([settings, user]) => {
        const results: CfpResult[] = []

        const startDate = new Date(specialVotingCfp.startDate)  
        const currentDate = new Date()
        const expiryDate = new Date(specialVotingCfp.endDate)

        // specialVotingCfp automatically disappears after expiryDate
        if (currentDate < expiryDate && currentDate > startDate) {
          results.push(specialVotingCfp)
        }

        setCfpResults(results);
        setVotes(votes);
        setCanVote(user.stakingBalance >= 100);
      })
      .catch(() => NotificationService.error(t("feedback.load_failed")))
      .finally(() => setIsLoading(false));
  }, []);

  const onVote = (number: number, vote: CfpVote) => {
    setVotes((votes) => {
      votes = { ...(votes ?? {}), [number]: vote };

      setIsSaving({ number, vote });
      putCfpVotes(votes).finally(() => setIsSaving(undefined));

      return votes;
    });
  };

  return (
    <AppLayout>
      <View style={[AppStyles.container, AppStyles.alignCenter]}>
        <H1 text={specialVotingCfp.title} style={AppStyles.center} />
        <SpacerV height={50} />

        {isLoading ? (
          <Loading size="large" />
        ) : (
          <>
            {cfpResults === undefined || (cfpResults.length === 0) && (
              <>
                <H3 text={t("specialVoting.ended")} />
                <SpacerV height={50} />
              </>
            )}

            {cfpResults
              ?.sort((a, b) => a.number - b.number)
              .map((result) => (
                <View key={result.number} style={{ width: "100%" }}>
                  <View style={AppStyles.halfWidth} >
                    <T5 text={t("specialVoting.explanation") + "\n\n\n"} />
                  </View>

                  <SpacerV />
                  <Text style={[AppStyles.center, AppStyles.b]}>{t("cfp.your_vote")}</Text>
                  <View style={[AppStyles.containerHorizontalWrap, styles.voteContainer]}>
                    <RadioButton
                      label={t("specialVoting.collectively")}
                      onPress={() => onVote(result.number, CfpVote.YES)}
                      checked={votes?.[result.number] === CfpVote.YES}
                      disabled={!canVote}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.YES}
                    />
                    <RadioButton
                      label={t("specialVoting.proportionally")}
                      onPress={() => onVote(result.number, CfpVote.NO)}
                      checked={votes?.[result.number] === CfpVote.NO}
                      disabled={!canVote}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NO}
                    />
                    <RadioButton
                      label={t("cfp.neutral")}
                      onPress={() => onVote(result.number, CfpVote.NEUTRAL)}
                      checked={(votes?.[result.number] ?? CfpVote.NEUTRAL) === CfpVote.NEUTRAL}
                      disabled={!canVote}
                      loading={isSaving?.number === result.number && isSaving.vote === CfpVote.NEUTRAL}
                    />
                  </View>

                  <View style={AppStyles.halfWidth} >
                    <T5 text={"\n\n\n" + t("specialVoting.description")} />
                  </View>

                  <SpacerV height={50} />
                </View>
              ))}
          </>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  voteContainer: {
    justifyContent: "center",
  },
});

export default withSession(SpecialVotingScreen);
